from fastapi import HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import time
import hashlib
import hmac
import re
from typing import Dict, Optional
from datetime import datetime, timedelta
import redis
import os
from database import get_db, User

# Redis client for rate limiting (fallback to in-memory if not available)
try:
    redis_client = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
    redis_client.ping()
    USE_REDIS = True
except:
    USE_REDIS = False
    # In-memory fallback for rate limiting
    rate_limit_store: Dict[str, Dict] = {}

# Security configuration
SECURITY_CONFIG = {
    "rate_limits": {
        "auth": {"requests": 5, "window": 300},  # 5 requests per 5 minutes
        "ai_generation": {"requests": 10, "window": 60},  # 10 requests per minute
        "file_upload": {"requests": 20, "window": 60},  # 20 uploads per minute
        "general": {"requests": 100, "window": 60},  # 100 requests per minute
        "webhook": {"requests": 50, "window": 60}  # 50 webhook calls per minute
    },
    "allowed_origins": [
        "https://filmfusion.app",
        "https://www.filmfusion.app",
        "https://filmfusion-frontend.vercel.app",
        "http://localhost:3000",  # Development
        "http://localhost:3001"   # Development
    ],
    "max_request_size": 50 * 1024 * 1024,  # 50MB
    "password_requirements": {
        "min_length": 8,
        "require_uppercase": True,
        "require_lowercase": True,
        "require_numbers": True,
        "require_special": True
    }
}

class RateLimiter:
    """Rate limiting middleware"""
    
    def __init__(self, requests: int, window: int):
        self.requests = requests
        self.window = window
    
    async def __call__(self, request: Request):
        # Get client identifier (IP + user agent hash for better uniqueness)
        client_ip = request.client.host
        user_agent = request.headers.get("user-agent", "")
        client_id = f"{client_ip}:{hashlib.md5(user_agent.encode()).hexdigest()[:8]}"
        
        current_time = int(time.time())
        window_start = current_time - self.window
        
        if USE_REDIS:
            # Use Redis for distributed rate limiting
            key = f"rate_limit:{client_id}"
            pipe = redis_client.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zcard(key)
            pipe.zadd(key, {str(current_time): current_time})
            pipe.expire(key, self.window)
            results = pipe.execute()
            
            request_count = results[1]
        else:
            # Use in-memory store
            if client_id not in rate_limit_store:
                rate_limit_store[client_id] = {"requests": [], "window_start": current_time}
            
            client_data = rate_limit_store[client_id]
            # Remove old requests outside the window
            client_data["requests"] = [req_time for req_time in client_data["requests"] if req_time > window_start]
            client_data["requests"].append(current_time)
            
            request_count = len(client_data["requests"])
        
        if request_count > self.requests:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Maximum {self.requests} requests per {self.window} seconds.",
                headers={"Retry-After": str(self.window)}
            )
        
        return True

def validate_password(password: str) -> bool:
    """Validate password against security requirements"""
    config = SECURITY_CONFIG["password_requirements"]
    
    if len(password) < config["min_length"]:
        return False
    
    if config["require_uppercase"] and not re.search(r'[A-Z]', password):
        return False
    
    if config["require_lowercase"] and not re.search(r'[a-z]', password):
        return False
    
    if config["require_numbers"] and not re.search(r'\d', password):
        return False
    
    if config["require_special"] and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
    
    return True

def sanitize_input(data: str, max_length: int = 1000) -> str:
    """Sanitize user input to prevent injection attacks"""
    if not isinstance(data, str):
        return str(data)[:max_length]
    
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>"\';\\]', '', data)
    
    # Limit length
    return sanitized[:max_length].strip()

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_username(username: str) -> bool:
    """Validate username format"""
    # Allow alphanumeric, underscore, hyphen, 3-30 characters
    pattern = r'^[a-zA-Z0-9_-]{3,30}$'
    return re.match(pattern, username) is not None

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify webhook signature for security"""
    if not signature or not secret:
        return False
    
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(f"sha256={expected_signature}", signature)

def get_client_info(request: Request) -> Dict[str, str]:
    """Extract client information for logging and security"""
    return {
        "ip": request.client.host,
        "user_agent": request.headers.get("user-agent", ""),
        "referer": request.headers.get("referer", ""),
        "origin": request.headers.get("origin", ""),
        "forwarded_for": request.headers.get("x-forwarded-for", ""),
        "real_ip": request.headers.get("x-real-ip", "")
    }

class SecurityHeaders:
    """Add security headers to responses"""
    
    @staticmethod
    def add_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        return response

# Rate limiter instances
auth_rate_limiter = RateLimiter(**SECURITY_CONFIG["rate_limits"]["auth"])
ai_rate_limiter = RateLimiter(**SECURITY_CONFIG["rate_limits"]["ai_generation"])
upload_rate_limiter = RateLimiter(**SECURITY_CONFIG["rate_limits"]["file_upload"])
general_rate_limiter = RateLimiter(**SECURITY_CONFIG["rate_limits"]["general"])
webhook_rate_limiter = RateLimiter(**SECURITY_CONFIG["rate_limits"]["webhook"])

async def check_user_permissions(current_user: User, required_permission: str = None) -> bool:
    """Check if user has required permissions"""
    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    
    # Add more permission checks as needed
    if required_permission == "premium" and not current_user.is_premium:
        raise HTTPException(status_code=403, detail="Premium subscription required")
    
    return True

def log_security_event(event_type: str, client_info: Dict, details: Dict = None):
    """Log security events for monitoring"""
    # In production, send to logging service like Sentry
    security_log = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "client_info": client_info,
        "details": details or {}
    }
    
    # For now, just print (replace with proper logging)
    print(f"[SECURITY] {security_log}")
