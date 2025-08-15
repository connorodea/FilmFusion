from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import openai
from openai import OpenAI
import stripe

from vercel_blob import put, delete, list_blobs

import asyncio
import json
import os
import uuid
from typing import List, Dict, Any
from datetime import datetime, timezone
import httpx
from pathlib import Path
import base64
import re

from database import get_db, create_tables, User, Project, RenderJob, ProjectAnalytics, AISession
from database import (
    get_user_by_email, get_user_by_username, create_user, get_user_projects, 
    create_project, update_project, create_render_job, update_render_job, log_ai_session
)
from auth import verify_password, get_password_hash, create_access_token, verify_token

from stripe_integration import (
    create_stripe_customer, create_checkout_session, create_usage_invoice,
    cancel_subscription, get_customer_portal_url, verify_webhook_signature,
    calculate_usage_charges, get_plan_limits, PRICING_CONFIG
)
from database import (
    get_user_by_stripe_customer_id, update_user_subscription, create_payment_record,
    update_user_usage, reset_monthly_usage, get_project
)

from security import (
    auth_rate_limiter, ai_rate_limiter, upload_rate_limiter, general_rate_limiter, webhook_rate_limiter,
    validate_password, sanitize_input, validate_email, validate_username,
    get_client_info, log_security_event, check_user_permissions, SecurityHeaders, SECURITY_CONFIG
)

from monitoring import (
    setup_monitoring, monitoring_middleware, performance_monitor, health_checker, 
    error_handler, logger
)

from email_service import email_service

import redis
import os
from pathlib import Path

app = FastAPI(title="FilmFusion Backend API", version="1.0.0")

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# Security
security = HTTPBearer()

app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["filmfusion-production-16fd.up.railway.app", "localhost", "127.0.0.1"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=SECURITY_CONFIG["allowed_origins"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=86400,  # Cache preflight requests for 24 hours
)

@app.middleware("http")
async def security_middleware(request: Request, call_next):
    """Add security headers and general rate limiting"""
    await general_rate_limiter(request)
    
    if request.headers.get("content-length"):
        content_length = int(request.headers["content-length"])
        if content_length > SECURITY_CONFIG["max_request_size"]:
            raise HTTPException(status_code=413, detail="Request too large")
    
    response = await call_next(request)
    
    response = SecurityHeaders.add_security_headers(response)
    
    return response

@app.middleware("http")
async def monitoring_middleware_wrapper(request: Request, call_next):
    """Wrapper for monitoring middleware"""
    return await monitoring_middleware(request, call_next)

@app.on_event("startup")
async def startup_event():
    create_tables()
    setup_monitoring()
    logger.info("FilmFusion Backend API started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("FilmFusion Backend API shutting down")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
VOLUME_PATH = Path("/volume")
VOLUME_PATH.mkdir(exist_ok=True)

# Initialize Redis connection
try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    redis_client.ping()
    print("✅ Redis connected successfully")
except Exception as e:
    print(f"❌ Redis connection failed: {e}")
    redis_client = None

@app.get("/health")
async def health_check():
    """Enhanced health check with Redis and volume status"""
    try:
        # Check database
        db_status = "healthy"
        db = next(get_db())
        try:
            db.execute(text("SELECT 1"))
        except Exception:
            db_status = "unhealthy"
        finally:
            db.close()
        
        redis_status = "healthy"
        if redis_client:
            try:
                redis_client.ping()
            except Exception:
                redis_status = "unhealthy"
        else:
            redis_status = "not_configured"
        
        volume_status = "healthy" if VOLUME_PATH.exists() and VOLUME_PATH.is_dir() else "unhealthy"
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "database": db_status,
                "redis": redis_status,
                "volume": volume_status,
                "openai": "configured" if OPENAI_API_KEY else "not_configured",
                "elevenlabs": "configured" if ELEVENLABS_API_KEY else "not_configured"
            }
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/health/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """Detailed health check with dependency status"""
    try:
        checks = {
            "database": await health_checker.check_database(db),
            "openai_api": await health_checker.check_openai_api(),
            "stripe_api": await health_checker.check_stripe_api(),
            "system_resources": health_checker.check_system_resources()
        }
        
        # Determine overall status
        statuses = [check["status"] for check in checks.values()]
        if "unhealthy" in statuses:
            overall_status = "unhealthy"
        elif "degraded" in statuses:
            overall_status = "degraded"
        else:
            overall_status = "healthy"
        
        return {
            "status": overall_status,
            "timestamp": datetime.utcnow().isoformat(),
            "checks": checks
        }
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/health/detailed"})
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }

@app.get("/metrics")
async def get_metrics():
    """Get application performance metrics"""
    try:
        metrics = performance_monitor.get_metrics()
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "metrics": metrics
        }
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/metrics"})
        raise HTTPException(status_code=500, detail="Failed to retrieve metrics")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

if redis_client:
    # Use Redis for WebSocket connection management
    async def add_connection(connection_id: str, websocket: WebSocket):
        await redis_client.hset("ws_connections", connection_id, "active")
    
    async def remove_connection(connection_id: str):
        await redis_client.hdel("ws_connections", connection_id)
else:
    # Fallback to in-memory storage
    active_connections: List[WebSocket] = []

containers: Dict[str, str] = {}  # Store container IDs for code interpreter

@app.get("/")
async def root():
    return {"message": "FilmFusion Backend API", "status": "running", "features": ["script_generation", "voiceover", "image_generation", "code_interpreter", "video_planning", "content_analysis", "visual_analysis", "workflow_debugging", "multi_agent_orchestration", "content_evaluation"]}

@app.post("/api/auth/register")
async def register(request: Request, data: dict, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        await auth_rate_limiter(request)
        
        client_info = get_client_info(request)
        
        email = data.get("email", "").strip().lower()
        username = data.get("username", "").strip()
        password = data.get("password", "")
        full_name = sanitize_input(data.get("full_name", ""), 100)
        
        if not email or not username or not password:
            log_security_event("registration_attempt_missing_fields", client_info)
            raise HTTPException(status_code=400, detail="Email, username, and password are required")
        
        if not validate_email(email):
            log_security_event("registration_attempt_invalid_email", client_info, {"email": email})
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        if not validate_username(username):
            log_security_event("registration_attempt_invalid_username", client_info, {"username": username})
            raise HTTPException(status_code=400, detail="Username must be 3-30 characters, alphanumeric, underscore, or hyphen only")
        
        if not validate_password(password):
            log_security_event("registration_attempt_weak_password", client_info)
            raise HTTPException(
                status_code=400, 
                detail="Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters"
            )
        
        # Check if user already exists
        if get_user_by_email(db, email):
            log_security_event("registration_attempt_duplicate_email", client_info, {"email": email})
            raise HTTPException(status_code=400, detail="Email already registered")
        
        if get_user_by_username(db, username):
            log_security_event("registration_attempt_duplicate_username", client_info, {"username": username})
            raise HTTPException(status_code=400, detail="Username already taken")
        
        # Create new user
        hashed_password = get_password_hash(password)
        user = create_user(db, email, username, hashed_password, full_name)
        
        try:
            await email_service.send_welcome_email(user.email, user.full_name or user.username)
        except Exception as e:
            logger.warning(f"Failed to send welcome email to {user.email}: {str(e)}")
        
        # Create access token
        access_token = create_access_token(data={"sub": str(user.id)})
        
        log_security_event("user_registered", client_info, {"user_id": user.id, "email": email})
        error_handler.log_business_event("user_registration", {"user_id": user.id, "email": email}, user.id)
        
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "full_name": user.full_name,
                "is_premium": user.is_premium
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        log_security_event("registration_error", client_info, {"error": str(e)})
        error_handler.log_error(e, {"endpoint": "/api/auth/register", "email": data.get("email")})
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login")
async def login(request: Request, data: dict, db: Session = Depends(get_db)):
    """Login user with enhanced security"""
    try:
        await auth_rate_limiter(request)
        
        client_info = get_client_info(request)
        
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        
        if not email or not password:
            log_security_event("login_attempt_missing_fields", client_info)
            raise HTTPException(status_code=400, detail="Email and password are required")
        
        if not validate_email(email):
            log_security_event("login_attempt_invalid_email", client_info, {"email": email})
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        # Get user by email
        user = get_user_by_email(db, email)
        if not user or not verify_password(password, user.hashed_password):
            log_security_event("login_attempt_failed", client_info, {"email": email})
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        if not user.is_active:
            log_security_event("login_attempt_inactive_user", client_info, {"user_id": user.id})
            raise HTTPException(status_code=403, detail="Account is deactivated")
        
        # Create access token
        access_token = create_access_token(data={"sub": str(user.id)})
        
        log_security_event("user_login", client_info, {"user_id": user.id, "email": email})
        error_handler.log_business_event("user_login", {"user_id": user.id, "email": email}, user.id)
        
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "full_name": user.full_name,
                "is_premium": user.is_premium
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        log_security_event("login_error", client_info, {"error": str(e)})
        error_handler.log_error(e, {"endpoint": "/api/auth/login", "email": data.get("email")})
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects")
async def get_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's projects"""
    projects = get_user_projects(db, current_user.id)
    
    return {
        "success": True,
        "projects": [{
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "status": p.status,
            "project_type": p.project_type,
            "duration": p.duration,
            "platform": p.platform,
            "thumbnail_url": p.thumbnail_url,
            "video_url": p.video_url,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "updated_at": p.updated_at.isoformat() if p.updated_at else None
        } for p in projects]
    }

@app.post("/api/projects")
async def create_new_project(request: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new project"""
    try:
        name = request.get("name")
        description = request.get("description")
        project_type = request.get("project_type")
        
        if not name:
            raise HTTPException(status_code=400, detail="Project name is required")
        
        project = create_project(db, current_user.id, name, description, project_type)
        
        return {
            "success": True,
            "project": {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "status": project.status,
                "project_type": project.project_type,
                "created_at": project.created_at.isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/analytics")
async def get_dashboard_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get dashboard analytics for user"""
    try:
        # Get user's projects and analytics
        projects = get_user_projects(db, current_user.id)
        total_projects = len(projects)
        
        # Calculate analytics
        completed_projects = len([p for p in projects if p.status == "completed"])
        in_progress_projects = len([p for p in projects if p.status == "in_progress"])
        
        # Get render jobs
        render_jobs = db.query(RenderJob).filter(RenderJob.user_id == current_user.id).all()
        total_renders = len(render_jobs)
        successful_renders = len([r for r in render_jobs if r.status == "completed"])
        
        # Get AI usage
        ai_sessions = db.query(AISession).filter(AISession.user_id == current_user.id).all()
        total_ai_calls = len(ai_sessions)
        total_tokens = sum(s.tokens_used for s in ai_sessions)
        
        return {
            "success": True,
            "analytics": {
                "total_projects": total_projects,
                "completed_projects": completed_projects,
                "in_progress_projects": in_progress_projects,
                "total_renders": total_renders,
                "successful_renders": successful_renders,
                "render_success_rate": (successful_renders / total_renders * 100) if total_renders > 0 else 0,
                "total_ai_calls": total_ai_calls,
                "total_tokens_used": total_tokens,
                "account_type": "Premium" if current_user.is_premium else "Free"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reasoning/plan-video")
async def plan_video_with_reasoning(request: dict):
    """Use reasoning models for complex video planning and strategy"""
    try:
        response = await openai_client.responses.create(
            model="gpt-5",  # Use reasoning model
            reasoning={
                "effort": request.get('reasoning_effort', 'medium'),  # low, medium, high
                "summary": "auto"  # Get reasoning summary
            },
            input=[{
                "role": "developer",
                "content": f"""
                Formatting re-enabled
                
                Plan a comprehensive video creation strategy for: {request.get('topic', 'product demo')}
                
                Requirements:
                - Target audience: {request.get('audience', 'general')}
                - Platform: {request.get('platform', 'YouTube')}
                - Duration: {request.get('duration', '5 minutes')}
                - Budget: {request.get('budget', 'moderate')}
                - Goals: {', '.join(request.get('goals', ['engagement', 'conversion']))}
                
                Create a detailed multi-step plan including:
                1. Content strategy and messaging
                2. Visual style and aesthetic direction
                3. Script structure and key talking points
                4. Production timeline and milestones
                5. Distribution and promotion strategy
                6. Success metrics and KPIs
                
                Consider current trends, platform best practices, and audience psychology.
                """
            }],
            max_output_tokens=25000  # Reserve space for reasoning
        )
        
        # Extract reasoning summary and plan
        reasoning_summary = ""
        plan_content = response.output_text or "Planning failed"
        
        for output in response.output:
            if output.type == "reasoning" and hasattr(output, 'summary'):
                reasoning_summary = output.summary[0].text if output.summary else ""
        
        return {
            "success": True,
            "plan": plan_content,
            "reasoning_summary": reasoning_summary,
            "reasoning_tokens": response.usage.output_tokens_details.reasoning_tokens if hasattr(response.usage, 'output_tokens_details') else 0,
            "total_tokens": response.usage.total_tokens,
            "response_id": response.id,
            "effort_level": request.get('reasoning_effort', 'medium')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video planning failed: {str(e)}")

@app.post("/api/reasoning/analyze-content")
async def analyze_content_with_reasoning(request: dict):
    """Use reasoning models for deep content analysis and optimization"""
    try:
        response = await openai_client.responses.create(
            model="gpt-5",
            reasoning={
                "effort": "high",  # Use high effort for detailed analysis
                "summary": "detailed"
            },
            input=[{
                "role": "developer", 
                "content": f"""
                Formatting re-enabled
                
                Analyze this video content for optimization opportunities:
                
                **Script:** {request.get('script', '')}
                **Target Platform:** {request.get('platform', 'YouTube')}
                **Current Performance:** {request.get('performance_data', 'No data available')}
                **Competitor Analysis:** {request.get('competitor_data', 'Not provided')}
                
                Provide detailed analysis including:
                1. Content strengths and weaknesses
                2. Audience engagement predictions
                3. Platform-specific optimization recommendations
                4. A/B testing suggestions
                5. Viral potential assessment
                6. Conversion optimization strategies
                
                Use data-driven insights and psychological principles to support recommendations.
                """
            }]
        )
        
        return {
            "success": True,
            "analysis": response.output_text,
            "reasoning_tokens": response.usage.output_tokens_details.reasoning_tokens if hasattr(response.usage, 'output_tokens_details') else 0,
            "response_id": response.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content analysis failed: {str(e)}")

@app.post("/api/reasoning/visual-analysis")
async def visual_analysis_with_reasoning(request: dict):
    """Use reasoning models for visual content analysis and recommendations"""
    try:
        # Handle image upload or URL
        image_data = request.get('image_data')  # Base64 encoded image
        image_url = request.get('image_url')
        
        content_parts = [{
            "type": "text",
            "text": f"""
            Formatting re-enabled
            
            Analyze this visual content for video production:
            
            **Context:** {request.get('context', 'Video thumbnail/visual asset')}
            **Platform:** {request.get('platform', 'YouTube')}
            **Target Audience:** {request.get('audience', 'general')}
            
            Provide detailed visual analysis including:
            1. Composition and design principles assessment
            2. Color psychology and brand alignment
            3. Accessibility and readability evaluation
            4. Platform-specific optimization suggestions
            5. A/B testing variations recommendations
            6. Emotional impact and engagement predictions
            
            Consider current design trends and platform best practices.
            """
        }]
        
        if image_data:
            content_parts.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}
            })
        elif image_url:
            content_parts.append({
                "type": "image_url", 
                "image_url": {"url": image_url}
            })
        
        response = await openai_client.responses.create(
            model="gpt-5",  # o1 supports vision
            reasoning={"effort": "medium", "summary": "auto"},
            input=[{
                "role": "developer",
                "content": content_parts
            }]
        )
        
        return {
            "success": True,
            "visual_analysis": response.output_text,
            "reasoning_tokens": response.usage.output_tokens_details.reasoning_tokens if hasattr(response.usage, 'output_tokens_details') else 0,
            "response_id": response.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Visual analysis failed: {str(e)}")

@app.post("/api/reasoning/debug-workflow")
async def debug_workflow_with_reasoning(request: dict):
    """Use reasoning models to debug and optimize video creation workflows"""
    try:
        response = await openai_client.responses.create(
            model="gpt-5",
            reasoning={"effort": "high", "summary": "detailed"},
            input=[{
                "role": "developer",
                "content": f"""
                Formatting re-enabled
                
                Debug and optimize this video creation workflow:
                
                **Current Workflow:** {request.get('workflow_steps', [])}
                **Issues Encountered:** {request.get('issues', [])}
                **Performance Metrics:** {request.get('metrics', {})}
                **Resource Constraints:** {request.get('constraints', {})}
                
                Provide comprehensive workflow optimization including:
                1. Root cause analysis of current issues
                2. Step-by-step workflow improvements
                3. Resource allocation optimization
                4. Quality assurance checkpoints
                5. Automation opportunities
                6. Scalability recommendations
                
                Focus on efficiency, quality, and maintainability.
                """
            }]
        )
        
        return {
            "success": True,
            "workflow_optimization": response.output_text,
            "reasoning_tokens": response.usage.output_tokens_details.reasoning_tokens if hasattr(response.usage, 'output_tokens_details') else 0,
            "response_id": response.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workflow debugging failed: {str(e)}")

@app.post("/api/reasoning/multi-agent-orchestration")
async def multi_agent_orchestration(request: dict):
    """Use reasoning models to orchestrate multiple AI agents for complex video projects"""
    try:
        # First, use reasoning model as the "planner"
        planning_response = await openai_client.responses.create(
            model="gpt-5",
            reasoning={"effort": "high", "summary": "auto"},
            input=[{
                "role": "developer",
                "content": f"""
                Formatting re-enabled
                
                Act as the master planner for this complex video project:
                
                **Project:** {request.get('project_description', '')}
                **Requirements:** {request.get('requirements', {})}
                **Available Resources:** {request.get('resources', {})}
                **Timeline:** {request.get('timeline', 'flexible')}
                
                Create a detailed execution plan that assigns specific tasks to specialized AI agents:
                1. Script Writer Agent - for content creation
                2. Visual Designer Agent - for graphics and thumbnails  
                3. Video Editor Agent - for timeline and effects
                4. SEO Optimizer Agent - for discoverability
                5. Quality Assurance Agent - for final review
                
                For each agent, specify:
                - Exact tasks and deliverables
                - Input requirements and dependencies
                - Success criteria and quality metrics
                - Handoff procedures between agents
                
                Optimize for efficiency and quality while managing dependencies.
                """
            }]
        )
        
        # Extract the plan and execute agent tasks
        master_plan = planning_response.output_text
        agent_results = {}
        
        # Execute tasks with appropriate models based on the plan
        if "script" in request.get('project_description', '').lower():
            # Use GPT model for script execution (faster)
            script_response = await openai_client.responses.create(
                model="gpt-4.1",
                input=f"Based on this plan: {master_plan}\n\nExecute the script writing task with these requirements: {request.get('requirements', {})}"
            )
            agent_results['script_agent'] = script_response.output_text
        
        if "visual" in request.get('project_description', '').lower():
            # Use reasoning model for complex visual planning
            visual_response = await openai_client.responses.create(
                model="gpt-5",
                reasoning={"effort": "medium"},
                input=[{
                    "role": "developer",
                    "content": f"Based on this plan: {master_plan}\n\nExecute the visual design task with these requirements: {request.get('requirements', {})}"
                }]
            )
            agent_results['visual_agent'] = visual_response.output_text
        
        return {
            "success": True,
            "master_plan": master_plan,
            "agent_results": agent_results,
            "orchestration_summary": "Multi-agent workflow executed successfully",
            "total_reasoning_tokens": planning_response.usage.output_tokens_details.reasoning_tokens if hasattr(planning_response.usage, 'output_tokens_details') else 0,
            "response_id": planning_response.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multi-agent orchestration failed: {str(e)}")

@app.post("/api/reasoning/evaluate-content")
async def evaluate_content_with_reasoning(request: dict):
    """Use reasoning models as judges to evaluate content quality"""
    try:
        response = await openai_client.responses.create(
            model="gpt-5",
            reasoning={"effort": "high", "summary": "detailed"},
            input=[{
                "role": "developer",
                "content": f"""
                Formatting re-enabled
                
                Act as an expert content evaluator and judge this video content:
                
                **Content to Evaluate:** {request.get('content', '')}
                **Content Type:** {request.get('content_type', 'script')}
                **Evaluation Criteria:** {request.get('criteria', ['quality', 'engagement', 'clarity', 'effectiveness'])}
                **Target Audience:** {request.get('audience', 'general')}
                **Platform:** {request.get('platform', 'YouTube')}
                
                Provide comprehensive evaluation including:
                1. Detailed scoring (1-10) for each criterion
                2. Specific strengths and weaknesses
                3. Improvement recommendations
                4. Comparison to industry benchmarks
                5. Predicted performance metrics
                6. Risk assessment and mitigation strategies
                
                Use objective analysis and provide actionable feedback.
                """
            }]
        )
        
        return {
            "success": True,
            "evaluation": response.output_text,
            "reasoning_summary": "",  # Extract from response if available
            "confidence_score": 0.95,  # High confidence due to reasoning model
            "reasoning_tokens": response.usage.output_tokens_details.reasoning_tokens if hasattr(response.usage, 'output_tokens_details') else 0,
            "response_id": response.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content evaluation failed: {str(e)}")

@app.get("/api/pricing")
async def get_pricing():
    """Get pricing plans and features"""
    return {
        "success": True,
        "plans": PRICING_CONFIG["plans"],
        "usage_pricing": PRICING_CONFIG["usage_pricing"]
    }

@app.post("/api/create-checkout-session")
async def create_checkout(request: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create Stripe checkout session for subscription"""
    try:
        plan = request.get('plan', 'pro')
        
        if plan not in PRICING_CONFIG['plans'] or plan == 'free':
            raise HTTPException(status_code=400, detail="Invalid plan selected")
        
        price_id = PRICING_CONFIG['plans'][plan]['price_id']
        if not price_id:
            raise HTTPException(status_code=400, detail="Plan not configured")
        
        # Create Stripe customer if doesn't exist
        if not current_user.stripe_customer_id:
            customer_result = await create_stripe_customer(
                email=current_user.email,
                name=current_user.full_name
            )
            
            if not customer_result['success']:
                raise HTTPException(status_code=500, detail="Failed to create customer")
            
            # Update user with Stripe customer ID
            current_user.stripe_customer_id = customer_result['customer_id']
            db.commit()
        
        # Create checkout session
        success_url = request.get('success_url', 'https://filmfusion.app/dashboard?payment=success')
        cancel_url = request.get('cancel_url', 'https://filmfusion.app/pricing?payment=canceled')
        
        session_result = await create_checkout_session(
            customer_id=current_user.stripe_customer_id,
            price_id=price_id,
            success_url=success_url,
            cancel_url=cancel_url
        )
        
        if not session_result['success']:
            raise HTTPException(status_code=500, detail="Failed to create checkout session")
        
        return {
            "success": True,
            "checkout_url": session_result['checkout_url'],
            "session_id": session_result['session_id']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cancel-subscription")
async def cancel_user_subscription(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Cancel user's subscription"""
    try:
        if not current_user.stripe_subscription_id:
            raise HTTPException(status_code=400, detail="No active subscription found")
        
        result = await cancel_subscription(current_user.stripe_subscription_id)
        
        if not result['success']:
            raise HTTPException(status_code=500, detail="Failed to cancel subscription")
        
        return {
            "success": True,
            "message": "Subscription will be canceled at the end of the billing period",
            "canceled_at": result['canceled_at']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/customer-portal")
async def get_customer_portal(current_user: User = Depends(get_current_user)):
    """Get Stripe customer portal URL"""
    try:
        if not current_user.stripe_customer_id:
            raise HTTPException(status_code=400, detail="No Stripe customer found")
        
        return_url = "https://filmfusion.app/dashboard"
        result = await get_customer_portal_url(current_user.stripe_customer_id, return_url)
        
        if not result['success']:
            raise HTTPException(status_code=500, detail="Failed to create portal session")
        
        return {
            "success": True,
            "portal_url": result['portal_url']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/usage")
async def get_user_usage(current_user: User = Depends(get_current_user)):
    """Get user's current usage and limits"""
    try:
        plan_limits = get_plan_limits(current_user.subscription_plan)
        
        usage_data = {
            "current_usage": {
                "ai_calls": current_user.monthly_ai_calls,
                "render_minutes": current_user.monthly_render_minutes,
                "storage_gb": current_user.monthly_storage_gb
            },
            "plan_limits": {
                "ai_calls_limit": plan_limits['ai_calls_limit'],
                "render_minutes_limit": plan_limits['render_minutes_limit'],
                "storage_gb_limit": plan_limits['storage_gb_limit']
            },
            "plan": current_user.subscription_plan,
            "subscription_status": current_user.subscription_status,
            "usage_reset_date": current_user.usage_reset_date.isoformat() if current_user.usage_reset_date else None
        }
        
        # Calculate potential overage charges
        overage_charges = calculate_usage_charges(usage_data['current_usage'], usage_data['plan_limits'])
        usage_data['potential_overage'] = overage_charges
        
        return {
            "success": True,
            "usage": usage_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stripe-webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhooks with enhanced security and comprehensive event processing"""
    try:
        await webhook_rate_limiter(request)
        
        payload = await request.body()
        signature = request.headers.get('stripe-signature')
        
        if not verify_webhook_signature(payload, signature):
            client_info = get_client_info(request)
            log_security_event("webhook_invalid_signature", client_info)
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        event = stripe.Event.construct_from(
            json.loads(payload), stripe.api_key
        )
        
        logger.info(f"Processing Stripe webhook: {event['type']}")
        
        # Handle different event types
        if event['type'] == 'customer.subscription.created':
            await handle_subscription_created(event['data']['object'], db)
        elif event['type'] == 'customer.subscription.updated':
            await handle_subscription_updated(event['data']['object'], db)
        elif event['type'] == 'customer.subscription.deleted':
            await handle_subscription_deleted(event['data']['object'], db)
        elif event['type'] == 'invoice.payment_succeeded':
            await handle_payment_succeeded(event['data']['object'], db)
        elif event['type'] == 'invoice.payment_failed':
            await handle_payment_failed(event['data']['object'], db)
        elif event['type'] == 'customer.subscription.trial_will_end':
            await handle_trial_ending(event['data']['object'], db)
        elif event['type'] == 'invoice.upcoming':
            await handle_upcoming_invoice(event['data']['object'], db)
        else:
            logger.info(f"Unhandled webhook event type: {event['type']}")
        
        return {"success": True, "event_type": event['type']}
    except HTTPException:
        raise
    except Exception as e:
        client_info = get_client_info(request)
        log_security_event("webhook_error", client_info, {"error": str(e), "event_type": event.get('type', 'unknown')})
        logger.error(f"Webhook processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def handle_subscription_created(subscription, db: Session):
    """Handle subscription creation with plan detection and email notification"""
    try:
        customer_id = subscription['customer']
        user = get_user_by_stripe_customer_id(db, customer_id)
        
        if not user:
            logger.error(f"User not found for Stripe customer: {customer_id}")
            return
        
        # Detect plan from price ID
        plan_name = detect_plan_from_price_id(subscription['items']['data'][0]['price']['id'])
        
        subscription_data = {
            'subscription_id': subscription['id'],
            'status': subscription['status'],
            'plan': plan_name,
            'period_start': datetime.fromtimestamp(subscription['current_period_start'], timezone.utc),
            'period_end': datetime.fromtimestamp(subscription['current_period_end'], timezone.utc),
            'cancel_at_period_end': subscription.get('cancel_at_period_end', False)
        }
        
        update_user_subscription(db, user.id, subscription_data)
        
        # Send welcome email
        await send_subscription_welcome_email(user.email, user.full_name, plan_name)
        
        logger.info(f"Subscription created for user {user.id}: {plan_name} plan")
        
    except Exception as e:
        logger.error(f"Error handling subscription created: {str(e)}")

async def handle_subscription_updated(subscription, db: Session):
    """Handle subscription updates including plan changes and cancellations"""
    try:
        customer_id = subscription['customer']
        user = get_user_by_stripe_customer_id(db, customer_id)
        
        if not user:
            logger.error(f"User not found for Stripe customer: {customer_id}")
            return
        
        # Detect current plan
        plan_name = detect_plan_from_price_id(subscription['items']['data'][0]['price']['id'])
        
        subscription_data = {
            'subscription_id': subscription['id'],
            'status': subscription['status'],
            'plan': plan_name,
            'period_start': datetime.fromtimestamp(subscription['current_period_start'], timezone.utc),
            'period_end': datetime.fromtimestamp(subscription['current_period_end'], timezone.utc),
            'cancel_at_period_end': subscription.get('cancel_at_period_end', False)
        }
        
        # Check if subscription was cancelled
        if subscription.get('cancel_at_period_end', False):
            await send_subscription_cancelled_email(user.email, user.full_name, subscription_data['period_end'])
        
        update_user_subscription(db, user.id, subscription_data)
        
        logger.info(f"Subscription updated for user {user.id}: {plan_name} plan, status: {subscription['status']}")
        
    except Exception as e:
        logger.error(f"Error handling subscription updated: {str(e)}")

async def handle_subscription_deleted(subscription, db: Session):
    """Handle subscription cancellation and downgrade to free plan"""
    try:
        customer_id = subscription['customer']
        user = get_user_by_stripe_customer_id(db, customer_id)
        
        if not user:
            logger.error(f"User not found for Stripe customer: {customer_id}")
            return
        
        subscription_data = {
            'subscription_id': None,
            'status': 'canceled',
            'plan': 'free',
            'period_start': None,
            'period_end': None,
            'cancel_at_period_end': False
        }
        
        update_user_subscription(db, user.id, subscription_data)
        
        # Send cancellation confirmation email
        await send_subscription_ended_email(user.email, user.full_name)
        
        logger.info(f"Subscription deleted for user {user.id}, downgraded to free plan")
        
    except Exception as e:
        logger.error(f"Error handling subscription deleted: {str(e)}")

async def handle_payment_succeeded(invoice, db: Session):
    """Handle successful payment and send receipt"""
    try:
        customer_id = invoice['customer']
        user = get_user_by_stripe_customer_id(db, customer_id)
        
        if not user:
            logger.error(f"User not found for Stripe customer: {customer_id}")
            return
        
        payment_data = {
            'payment_intent_id': invoice.get('payment_intent'),
            'invoice_id': invoice['id'],
            'amount': invoice['amount_paid'],
            'currency': invoice['currency'],
            'status': 'succeeded',
            'type': 'subscription' if invoice.get('subscription') else 'usage',
            'description': invoice.get('description', 'FilmFusion payment'),
            'created_at': datetime.fromtimestamp(invoice['created'], timezone.utc)
        }
        
        create_payment_record(db, user.id, payment_data)
        
        # Send payment receipt email
        await send_payment_receipt_email(
            user.email, 
            user.full_name, 
            payment_data['amount'] / 100,  # Convert cents to dollars
            payment_data['description']
        )
        
        logger.info(f"Payment succeeded for user {user.id}: ${payment_data['amount']/100:.2f}")
        
    except Exception as e:
        logger.error(f"Error handling payment succeeded: {str(e)}")

async def handle_payment_failed(invoice, db: Session):
    """Handle failed payment and notify user"""
    try:
        customer_id = invoice['customer']
        user = get_user_by_stripe_customer_id(db, customer_id)
        
        if not user:
            logger.error(f"User not found for Stripe customer: {customer_id}")
            return
        
        payment_data = {
            'payment_intent_id': invoice.get('payment_intent'),
            'invoice_id': invoice['id'],
            'amount': invoice['amount_due'],
            'currency': invoice['currency'],
            'status': 'failed',
            'type': 'subscription' if invoice.get('subscription') else 'usage',
            'description': invoice.get('description', 'FilmFusion payment'),
            'created_at': datetime.fromtimestamp(invoice['created'], timezone.utc)
        }
        
        create_payment_record(db, user.id, payment_data)
        
        # Send payment failed notification
        await send_payment_failed_email(
            user.email, 
            user.full_name, 
            payment_data['amount'] / 100,
            invoice.get('hosted_invoice_url')
        )
        
        logger.warning(f"Payment failed for user {user.id}: ${payment_data['amount']/100:.2f}")
        
    except Exception as e:
        logger.error(f"Error handling payment failed: {str(e)}")

async def handle_trial_ending(subscription, db: Session):
    """Handle trial ending notification"""
    try:
        customer_id = subscription['customer']
        user = get_user_by_stripe_customer_id(db, customer_id)
        
        if not user:
            return
        
        trial_end = datetime.fromtimestamp(subscription['trial_end'], timezone.utc)
        await send_trial_ending_email(user.email, user.full_name, trial_end)
        
        logger.info(f"Trial ending notification sent to user {user.id}")
        
    except Exception as e:
        logger.error(f"Error handling trial ending: {str(e)}")

async def handle_upcoming_invoice(invoice, db: Session):
    """Handle upcoming invoice notification"""
    try:
        customer_id = invoice['customer']
        user = get_user_by_stripe_customer_id(db, customer_id)
        
        if not user:
            return
        
        amount = invoice['amount_due'] / 100
        due_date = datetime.fromtimestamp(invoice['period_end'], timezone.utc)
        
        await send_upcoming_invoice_email(user.email, user.full_name, amount, due_date)
        
        logger.info(f"Upcoming invoice notification sent to user {user.id}: ${amount:.2f}")
        
    except Exception as e:
        logger.error(f"Error handling upcoming invoice: {str(e)}")

def detect_plan_from_price_id(price_id: str) -> str:
    """Detect plan name from Stripe price ID"""
    for plan_name, plan_config in PRICING_CONFIG['plans'].items():
        if plan_config.get('price_id') == price_id:
            return plan_name
    return 'free'  # Default fallback
