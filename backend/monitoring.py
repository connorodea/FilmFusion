import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.httpx import HttpxIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
import logging
import time
import psutil
import os
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import Request, Response
from sqlalchemy.orm import Session
import json
import asyncio
from pathlib import Path

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('logs/filmfusion.log') if Path('logs').exists() else logging.NullHandler()
    ]
)

logger = logging.getLogger("filmfusion")

# Initialize Sentry for error monitoring
def init_sentry():
    """Initialize Sentry error monitoring"""
    sentry_dsn = os.getenv("SENTRY_DSN")
    environment = os.getenv("ENVIRONMENT", "development")
    
    if sentry_dsn:
        sentry_sdk.init(
            dsn=sentry_dsn,
            environment=environment,
            integrations=[
                FastApiIntegration(auto_enabling_integrations=False),
                SqlalchemyIntegration(),
                HttpxIntegration(),
                LoggingIntegration(level=logging.INFO, event_level=logging.ERROR)
            ],
            traces_sample_rate=0.1,  # 10% of transactions for performance monitoring
            profiles_sample_rate=0.1,  # 10% for profiling
            attach_stacktrace=True,
            send_default_pii=False,  # Don't send personally identifiable information
            before_send=filter_sensitive_data,
            release=os.getenv("VERCEL_GIT_COMMIT_SHA", "unknown")
        )
        logger.info("Sentry initialized successfully")
    else:
        logger.warning("Sentry DSN not provided, error monitoring disabled")

def filter_sensitive_data(event, hint):
    """Filter sensitive data from Sentry events"""
    # Remove sensitive headers
    if 'request' in event and 'headers' in event['request']:
        sensitive_headers = ['authorization', 'cookie', 'x-api-key', 'stripe-signature']
        for header in sensitive_headers:
            if header in event['request']['headers']:
                event['request']['headers'][header] = '[Filtered]'
    
    # Remove sensitive form data
    if 'request' in event and 'data' in event['request']:
        sensitive_fields = ['password', 'token', 'api_key', 'secret']
        for field in sensitive_fields:
            if field in event['request']['data']:
                event['request']['data'][field] = '[Filtered]'
    
    return event

class PerformanceMonitor:
    """Monitor application performance metrics"""
    
    def __init__(self):
        self.metrics = {
            "requests_total": 0,
            "requests_failed": 0,
            "response_times": [],
            "active_connections": 0,
            "ai_calls_total": 0,
            "render_jobs_total": 0,
            "database_queries": 0
        }
        self.start_time = time.time()
    
    def record_request(self, method: str, path: str, status_code: int, response_time: float, user_id: Optional[int] = None):
        """Record request metrics"""
        self.metrics["requests_total"] += 1
        if status_code >= 400:
            self.metrics["requests_failed"] += 1
        
        self.metrics["response_times"].append(response_time)
        
        # Keep only last 1000 response times for memory efficiency
        if len(self.metrics["response_times"]) > 1000:
            self.metrics["response_times"] = self.metrics["response_times"][-1000:]
        
        # Log slow requests
        if response_time > 5.0:  # 5 seconds
            logger.warning(f"Slow request: {method} {path} took {response_time:.2f}s", extra={
                "method": method,
                "path": path,
                "response_time": response_time,
                "status_code": status_code,
                "user_id": user_id
            })
    
    def record_ai_call(self, model: str, tokens: int, cost: float = 0.0):
        """Record AI API call metrics"""
        self.metrics["ai_calls_total"] += 1
        logger.info(f"AI call: {model} used {tokens} tokens", extra={
            "model": model,
            "tokens": tokens,
            "cost": cost
        })
    
    def record_render_job(self, status: str, duration: Optional[float] = None):
        """Record render job metrics"""
        self.metrics["render_jobs_total"] += 1
        logger.info(f"Render job {status}", extra={
            "status": status,
            "duration": duration
        })
    
    def record_database_query(self, query_type: str, duration: float):
        """Record database query metrics"""
        self.metrics["database_queries"] += 1
        if duration > 1.0:  # Log slow queries
            logger.warning(f"Slow database query: {query_type} took {duration:.2f}s", extra={
                "query_type": query_type,
                "duration": duration
            })
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current performance metrics"""
        uptime = time.time() - self.start_time
        avg_response_time = sum(self.metrics["response_times"]) / len(self.metrics["response_times"]) if self.metrics["response_times"] else 0
        
        return {
            "uptime_seconds": uptime,
            "requests_total": self.metrics["requests_total"],
            "requests_failed": self.metrics["requests_failed"],
            "error_rate": (self.metrics["requests_failed"] / max(self.metrics["requests_total"], 1)) * 100,
            "avg_response_time": avg_response_time,
            "ai_calls_total": self.metrics["ai_calls_total"],
            "render_jobs_total": self.metrics["render_jobs_total"],
            "database_queries": self.metrics["database_queries"],
            "active_connections": self.metrics["active_connections"]
        }

class HealthChecker:
    """Health check utilities"""
    
    @staticmethod
    async def check_database(db: Session) -> Dict[str, Any]:
        """Check database connectivity and performance"""
        try:
            start_time = time.time()
            # Simple query to test database
            result = db.execute("SELECT 1").fetchone()
            query_time = time.time() - start_time
            
            return {
                "status": "healthy",
                "response_time_ms": round(query_time * 1000, 2),
                "details": "Database connection successful"
            }
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "details": "Database connection failed"
            }
    
    @staticmethod
    async def check_openai_api() -> Dict[str, Any]:
        """Check OpenAI API connectivity"""
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                start_time = time.time()
                response = await client.get(
                    "https://api.openai.com/v1/models",
                    headers={"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"},
                    timeout=10.0
                )
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    return {
                        "status": "healthy",
                        "response_time_ms": round(response_time * 1000, 2),
                        "details": "OpenAI API accessible"
                    }
                else:
                    return {
                        "status": "degraded",
                        "status_code": response.status_code,
                        "details": "OpenAI API returned non-200 status"
                    }
        except Exception as e:
            logger.error(f"OpenAI API health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "details": "OpenAI API connection failed"
            }
    
    @staticmethod
    async def check_stripe_api() -> Dict[str, Any]:
        """Check Stripe API connectivity"""
        try:
            import stripe
            start_time = time.time()
            stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
            
            # Simple API call to test connectivity
            stripe.Account.retrieve()
            response_time = time.time() - start_time
            
            return {
                "status": "healthy",
                "response_time_ms": round(response_time * 1000, 2),
                "details": "Stripe API accessible"
            }
        except Exception as e:
            logger.error(f"Stripe API health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "details": "Stripe API connection failed"
            }
    
    @staticmethod
    def check_system_resources() -> Dict[str, Any]:
        """Check system resource usage"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Determine health status based on resource usage
            status = "healthy"
            if cpu_percent > 80 or memory.percent > 85 or disk.percent > 90:
                status = "degraded"
            if cpu_percent > 95 or memory.percent > 95 or disk.percent > 95:
                status = "unhealthy"
            
            return {
                "status": status,
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "disk_percent": disk.percent,
                "details": f"CPU: {cpu_percent}%, Memory: {memory.percent}%, Disk: {disk.percent}%"
            }
        except Exception as e:
            logger.error(f"System resource check failed: {str(e)}")
            return {
                "status": "unknown",
                "error": str(e),
                "details": "Unable to check system resources"
            }

class RequestLogger:
    """Log HTTP requests and responses"""
    
    @staticmethod
    def log_request(request: Request, user_id: Optional[int] = None):
        """Log incoming request"""
        logger.info(f"Request: {request.method} {request.url.path}", extra={
            "method": request.method,
            "path": request.url.path,
            "query_params": dict(request.query_params),
            "user_agent": request.headers.get("user-agent"),
            "ip": request.client.host,
            "user_id": user_id
        })
    
    @staticmethod
    def log_response(request: Request, response: Response, response_time: float, user_id: Optional[int] = None):
        """Log response"""
        logger.info(f"Response: {request.method} {request.url.path} - {response.status_code}", extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "response_time": response_time,
            "user_id": user_id
        })

class ErrorHandler:
    """Handle and log application errors"""
    
    @staticmethod
    def log_error(error: Exception, context: Dict[str, Any] = None):
        """Log application error with context"""
        logger.error(f"Application error: {str(error)}", extra={
            "error_type": type(error).__name__,
            "error_message": str(error),
            "context": context or {}
        }, exc_info=True)
        
        # Send to Sentry if configured
        if sentry_sdk.Hub.current.client:
            with sentry_sdk.push_scope() as scope:
                if context:
                    for key, value in context.items():
                        scope.set_extra(key, value)
                sentry_sdk.capture_exception(error)
    
    @staticmethod
    def log_business_event(event_type: str, details: Dict[str, Any], user_id: Optional[int] = None):
        """Log business events for analytics"""
        logger.info(f"Business event: {event_type}", extra={
            "event_type": event_type,
            "details": details,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        })

# Global instances
performance_monitor = PerformanceMonitor()
health_checker = HealthChecker()
request_logger = RequestLogger()
error_handler = ErrorHandler()

# Middleware for request/response logging and monitoring
async def monitoring_middleware(request: Request, call_next):
    """Middleware for monitoring requests and responses"""
    start_time = time.time()
    user_id = None
    
    # Extract user ID from token if available
    try:
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            from auth import verify_token
            token = auth_header.split(" ")[1]
            payload = verify_token(token)
            if payload:
                user_id = int(payload.get("sub", 0))
    except:
        pass  # Ignore token parsing errors
    
    # Log request
    request_logger.log_request(request, user_id)
    
    try:
        response = await call_next(request)
        response_time = time.time() - start_time
        
        # Log response
        request_logger.log_response(request, response, response_time, user_id)
        
        # Record metrics
        performance_monitor.record_request(
            request.method,
            request.url.path,
            response.status_code,
            response_time,
            user_id
        )
        
        return response
    
    except Exception as e:
        response_time = time.time() - start_time
        
        # Log error
        error_handler.log_error(e, {
            "method": request.method,
            "path": request.url.path,
            "user_id": user_id,
            "response_time": response_time
        })
        
        # Record failed request
        performance_monitor.record_request(
            request.method,
            request.url.path,
            500,
            response_time,
            user_id
        )
        
        raise

def setup_monitoring():
    """Initialize all monitoring components"""
    # Create logs directory if it doesn't exist
    Path("logs").mkdir(exist_ok=True)
    
    # Initialize Sentry
    init_sentry()
    
    logger.info("Monitoring system initialized")
