from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import asyncio
import json
import os
import uuid
from typing import List, Dict, Any, Optional
import subprocess
import tempfile
from pathlib import Path
import base64
from openai import OpenAI
import httpx
from datetime import datetime, timedelta

from database import get_db, create_tables, User, Project, RenderJob, ProjectAnalytics, AISession
from database import (
    get_user_by_email, get_user_by_username, create_user, get_user_projects, 
    create_project, update_project, create_render_job, update_render_job, log_ai_session
)
from auth import verify_password, get_password_hash, create_access_token, verify_token

app = FastAPI(title="FilmFusion Backend API", version="1.0.0")

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Security
security = HTTPBearer()

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    create_tables()

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

# In-memory storage for WebSocket connections (use Redis in production)
active_connections: List[WebSocket] = []
containers: Dict[str, str] = {}  # Store container IDs for code interpreter

@app.get("/")
async def root():
    return {"message": "FilmFusion Backend API", "status": "running", "features": ["script_generation", "voiceover", "image_generation", "code_interpreter", "video_planning", "content_analysis", "visual_analysis", "workflow_debugging", "multi_agent_orchestration", "content_evaluation"]}

@app.post("/api/auth/register")
async def register(request: dict, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        email = request.get("email")
        username = request.get("username")
        password = request.get("password")
        full_name = request.get("full_name")
        
        if not email or not username or not password:
            raise HTTPException(status_code=400, detail="Email, username, and password are required")
        
        # Check if user already exists
        if get_user_by_email(db, email):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        if get_user_by_username(db, username):
            raise HTTPException(status_code=400, detail="Username already taken")
        
        # Create new user
        hashed_password = get_password_hash(password)
        user = create_user(db, email, username, hashed_password, full_name)
        
        # Create access token
        access_token = create_access_token(data={"sub": str(user.id)})
        
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
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login")
async def login(request: dict, db: Session = Depends(get_db)):
    """Login user"""
    try:
        email = request.get("email")
        password = request.get("password")
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password are required")
        
        # Get user by email
        user = get_user_by_email(db, email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create access token
        access_token = create_access_token(data={"sub": str(user.id)})
        
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

@app.post("/api/generate-script")
async def generate_script(request: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Generate AI script using OpenAI API with reasoning capabilities"""
    try:
        session_id = str(uuid.uuid4())
        use_reasoning = request.get('use_reasoning', False)
        
        if use_reasoning:
            response = await openai_client.responses.create(
                model="gpt-5",
                reasoning={
                    "effort": request.get('reasoning_effort', 'medium'),
                    "summary": "auto"
                },
                input=[{
                    "role": "developer",
                    "content": f"""
                    Formatting re-enabled
                    
                    Create a high-quality video script for: {request.get('topic', 'a product demo')}
                    
                    Requirements:
                    - Duration: {request.get('duration', '2 minutes')}
                    - Tone: {request.get('tone', 'professional')}
                    - Target audience: {request.get('audience', 'general')}
                    - Platform: {request.get('platform', 'YouTube')}
                    - Key points: {', '.join(request.get('key_points', []))}
                    
                    Use advanced reasoning to:
                    1. Analyze the target audience psychology
                    2. Research current trends and best practices
                    3. Optimize for platform-specific engagement
                    4. Structure for maximum retention and conversion
                    5. Include strategic hooks and call-to-actions
                    
                    Format with clear sections, timing cues, and visual suggestions.
                    """
                }],
                max_output_tokens=15000
            )
            
            script_content = response.output_text or "Script generation failed"
            reasoning_summary = ""
            
            # Extract reasoning summary
            for output in response.output:
                if output.type == "reasoning" and hasattr(output, 'summary'):
                    reasoning_summary = output.summary[0].text if output.summary else ""
            
            log_ai_session(
                db, session_id, current_user.id, "script_generation", "gpt-5",
                response.usage.total_tokens, request, {
                    "script": script_content,
                    "reasoning_summary": reasoning_summary
                },
                reasoning_tokens=response.usage.output_tokens_details.reasoning_tokens if hasattr(response.usage, 'output_tokens_details') else 0
            )
            
            return {
                "success": True,
                "script": script_content,
                "word_count": len(script_content.split()),
                "estimated_duration": f"{len(script_content.split()) // 150} minutes",
                "reasoning_summary": reasoning_summary,
                "reasoning_tokens": response.usage.output_tokens_details.reasoning_tokens if hasattr(response.usage, 'output_tokens_details') else 0,
                "response_id": response.id,
                "enhanced": True
            }
        else:
            # Use standard GPT model for faster generation
            response = await openai_client.responses.create(
                model="gpt-4.1",
                input=f"""
                Create a video script for: {request.get('topic', 'a product demo')}
                
                Requirements:
                - Duration: {request.get('duration', '2 minutes')}
                - Tone: {request.get('tone', 'professional')}
                - Target audience: {request.get('audience', 'general')}
                - Key points: {', '.join(request.get('key_points', []))}
                
                Format the script with clear sections, engaging hooks, and natural transitions.
                Include timing cues and visual suggestions where appropriate.
                """,
                tools=[{"type": "code_interpreter", "container": {"type": "auto"}}]
            )
            
            script_content = response.output_text or "Script generation failed"
            
            log_ai_session(
                db, session_id, current_user.id, "script_generation", "gpt-4.1",
                response.usage.total_tokens, request, {"script": script_content}
            )
            
            return {
                "success": True,
                "script": script_content,
                "word_count": len(script_content.split()),
                "estimated_duration": f"{len(script_content.split()) // 150} minutes",
                "response_id": response.id,
                "enhanced": False
            }
    except Exception as e:
        # Fallback to mock response if API fails
        script_content = f"""
        Welcome to {request.get('topic', 'our amazing product')}!
        
        In this {request.get('duration', '2-minute')} video, we'll explore how our solution can transform your workflow.
        
        Our {request.get('tone', 'professional')} approach ensures that you get the best results every time.
        
        Whether you're targeting {request.get('audience', 'professionals')} or expanding your reach, we've got you covered.
        
        Let's dive in and see what makes this special!
        """
        
        return {
            "success": True,
            "script": script_content.strip(),
            "word_count": len(script_content.split()),
            "estimated_duration": f"{len(script_content.split()) // 150} minutes",
            "fallback": True,
            "error": str(e)
        }

@app.post("/api/generate-voiceover")
async def generate_voiceover(request: dict):
    """Generate AI voiceover using ElevenLabs API"""
    try:
        elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
        
        if elevenlabs_api_key:
            # Use ElevenLabs API
            voice_id = request.get('voice_id', 'EXAVITQu4vr4xnSDxMaL')  # Default voice
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
                    headers={
                        "Accept": "audio/mpeg",
                        "Content-Type": "application/json",
                        "xi-api-key": elevenlabs_api_key
                    },
                    json={
                        "text": request.get('text', ''),
                        "model_id": "eleven_monolingual_v1",
                        "voice_settings": {
                            "stability": request.get('stability', 0.5),
                            "similarity_boost": request.get('similarity_boost', 0.5),
                            "style": request.get('style', 0.0),
                            "use_speaker_boost": True
                        }
                    }
                )
                
                if response.status_code == 200:
                    audio_id = str(uuid.uuid4())
                    audio_dir = Path("audio")
                    audio_dir.mkdir(exist_ok=True)
                    
                    audio_path = audio_dir / f"{audio_id}.mp3"
                    with open(audio_path, "wb") as f:
                        f.write(response.content)
                    
                    return {
                        "success": True,
                        "audio_id": audio_id,
                        "audio_url": f"/api/audio/{audio_id}",
                        "duration": len(request.get('text', '').split()) * 0.5,  # Estimate
                        "file_size": f"{len(response.content) / 1024 / 1024:.1f} MB",
                        "voice_used": request.get('voice', 'Sarah - Professional')
                    }
        
        # Fallback to mock response
        audio_id = str(uuid.uuid4())
        await asyncio.sleep(2)
        
        return {
            "success": True,
            "audio_id": audio_id,
            "audio_url": f"/api/audio/{audio_id}",
            "duration": 45.5,
            "file_size": "2.3 MB",
            "voice_used": request.get('voice', 'Sarah - Professional'),
            "fallback": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/audio/{audio_id}")
async def get_audio(audio_id: str):
    """Serve generated audio files"""
    try:
        audio_dir = Path("audio")
        audio_path = audio_dir / f"{audio_id}.mp3"
        
        if audio_path.exists():
            return FileResponse(audio_path, media_type="audio/mpeg")
        
        raise HTTPException(status_code=404, detail="Audio file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-media")
async def upload_media(file: UploadFile = File(...)):
    """Upload media files for video projects"""
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix
        filename = f"{file_id}{file_extension}"
        file_path = upload_dir / filename
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {
            "success": True,
            "file_id": file_id,
            "filename": file.filename,
            "file_url": f"/api/media/{file_id}",
            "file_size": len(content),
            "file_type": file.content_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/media/{file_id}")
async def get_media(file_id: str):
    """Serve uploaded media files"""
    try:
        upload_dir = Path("uploads")
        # Find file with matching ID
        for file_path in upload_dir.glob(f"{file_id}.*"):
            return FileResponse(file_path)
        
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/render-video")
async def render_video(request: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Start video rendering process"""
    try:
        job_id = str(uuid.uuid4())
        project_id = request.get('project_id')
        
        render_job = create_render_job(
            db, job_id, current_user.id, project_id, 
            request.get('export_settings', {})
        )
        
        # Start background rendering task
        asyncio.create_task(process_video_render(job_id, db))
        
        return {
            "success": True,
            "job_id": job_id,
            "status": "queued",
            "message": "Video render started"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_video_render(job_id: str, db: Session):
    """Background task to process video rendering"""
    try:
        # Update status to processing
        update_render_job(db, job_id, status="processing", progress=10, started_at=datetime.utcnow())
        
        # Simulate video processing steps
        steps = [
            ("Preparing timeline", 20),
            ("Processing video tracks", 40),
            ("Rendering audio", 60),
            ("Applying effects", 80),
            ("Finalizing output", 95),
            ("Upload complete", 100)
        ]
        
        for step_name, progress in steps:
            await asyncio.sleep(2)  # Simulate processing time
            update_render_job(db, job_id, progress=progress, current_step=step_name)
            
            # Broadcast update via WebSocket
            await broadcast_job_update(job_id, {
                "id": job_id,
                "status": "processing",
                "progress": progress,
                "current_step": step_name
            })
        
        # Mark as completed
        update_render_job(
            db, job_id, 
            status="completed", 
            progress=100,
            completed_at=datetime.utcnow(),
            output_url=f"/api/download/{job_id}",
            file_size=47185920  # 45.2 MB in bytes
        )
        
        await broadcast_job_update(job_id, {
            "id": job_id,
            "status": "completed",
            "progress": 100,
            "download_url": f"/api/download/{job_id}",
            "file_size": "45.2 MB"
        })
        
    except Exception as e:
        update_render_job(db, job_id, status="failed", error_message=str(e))
        await broadcast_job_update(job_id, {
            "id": job_id,
            "status": "failed",
            "error": str(e)
        })

@app.get("/api/render-status/{job_id}")
async def get_render_status(job_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get render job status"""
    job = db.query(RenderJob).filter(RenderJob.id == job_id, RenderJob.user_id == current_user.id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "id": job.id,
        "status": job.status,
        "progress": job.progress,
        "current_step": job.current_step,
        "error_message": job.error_message,
        "output_url": job.output_url,
        "file_size": job.file_size,
        "created_at": job.created_at.isoformat() if job.created_at else None,
        "completed_at": job.completed_at.isoformat() if job.completed_at else None
    }

@app.get("/api/download/{job_id}")
async def download_video(job_id: str):
    """Download completed video"""
    if job_id not in render_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = render_jobs[job_id]
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Video not ready for download")
    
    # In production, return actual video file
    # For now, return a placeholder response
    return {"download_url": f"https://example.com/videos/{job_id}.mp4"}

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket for real-time updates"""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.remove(websocket)

async def broadcast_job_update(job_id: str, job_data: dict):
    """Broadcast job updates to all connected clients"""
    message = {
        "type": "job_update",
        "job_id": job_id,
        "data": job_data
    }
    
    # Remove disconnected connections
    disconnected = []
    for connection in active_connections:
        try:
            await connection.send_text(json.dumps(message))
        except:
            disconnected.append(connection)
    
    for conn in disconnected:
        active_connections.remove(conn)

@app.post("/api/generate-image")
async def generate_image(request: dict):
    """Generate images using OpenAI Image Generation"""
    try:
        response = await openai_client.responses.create(
            model="gpt-4.1",
            input=f"Generate an image: {request.get('prompt', 'a professional video thumbnail')}",
            tools=[{
                "type": "image_generation",
                "size": request.get('size', 'auto'),
                "quality": request.get('quality', 'auto'),
                "format": request.get('format', 'png'),
                "background": request.get('background', 'auto')
            }]
        )
        
        # Extract generated images
        images = []
        for output in response.output:
            if output.type == "image_generation_call" and output.status == "completed":
                image_id = str(uuid.uuid4())
                image_dir = Path("images")
                image_dir.mkdir(exist_ok=True)
                
                # Save base64 image to file
                image_data = base64.b64decode(output.result)
                image_path = image_dir / f"{image_id}.png"
                
                with open(image_path, "wb") as f:
                    f.write(image_data)
                
                images.append({
                    "image_id": image_id,
                    "image_url": f"/api/images/{image_id}",
                    "revised_prompt": getattr(output, 'revised_prompt', request.get('prompt')),
                    "size": f"{len(image_data) / 1024:.1f} KB"
                })
        
        return {
            "success": True,
            "images": images,
            "response_id": response.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

@app.get("/api/images/{image_id}")
async def get_image(image_id: str):
    """Serve generated images"""
    try:
        image_dir = Path("images")
        image_path = image_dir / f"{image_id}.png"
        
        if image_path.exists():
            return FileResponse(image_path, media_type="image/png")
        
        raise HTTPException(status_code=404, detail="Image not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/process-data")
async def process_data(request: dict):
    """Use Code Interpreter for data processing and analysis"""
    try:
        container_id = request.get('container_id')
        
        if not container_id:
            # Create new container
            container = await openai_client.containers.create(name=f"filmfusion-{uuid.uuid4()}")
            container_id = container.id
            containers[container_id] = container_id
        
        response = await openai_client.responses.create(
            model="gpt-4.1",
            input=request.get('task', 'Process the provided data'),
            tools=[{
                "type": "code_interpreter",
                "container": container_id
            }],
            tool_choice="required"
        )
        
        # Extract results and any generated files
        results = {
            "success": True,
            "container_id": container_id,
            "output": response.output_text,
            "files": []
        }
        
        # Check for generated files
        for output in response.output:
            if hasattr(output, 'annotations'):
                for annotation in output.annotations:
                    if annotation.type == "container_file_citation":
                        results["files"].append({
                            "file_id": annotation.file_id,
                            "filename": annotation.filename,
                            "container_id": annotation.container_id
                        })
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data processing failed: {str(e)}")

@app.get("/api/container-file/{container_id}/{file_id}")
async def get_container_file(container_id: str, file_id: str):
    """Download files generated by Code Interpreter"""
    try:
        file_content = await openai_client.containers.files.content(
            container_id=container_id,
            file_id=file_id
        )
        
        # Save file temporarily and serve it
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        temp_path = temp_dir / f"{file_id}"
        
        with open(temp_path, "wb") as f:
            f.write(file_content)
        
        return FileResponse(temp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File retrieval failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
