from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import asyncio
import json
import os
import uuid
from typing import List, Dict, Any
import subprocess
import tempfile
from pathlib import Path

app = FastAPI(title="FilmFusion Backend API", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo (use Redis/Database in production)
render_jobs: Dict[str, Dict] = {}
active_connections: List[WebSocket] = []

@app.get("/")
async def root():
    return {"message": "FilmFusion Backend API", "status": "running"}

@app.post("/api/generate-script")
async def generate_script(request: dict):
    """Generate AI script using OpenAI API"""
    try:
        # Mock response for now - integrate with OpenAI API
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
            "estimated_duration": f"{len(script_content.split()) // 150} minutes"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-voiceover")
async def generate_voiceover(request: dict):
    """Generate AI voiceover using ElevenLabs API"""
    try:
        # Mock response for now - integrate with ElevenLabs API
        audio_id = str(uuid.uuid4())
        
        # Simulate processing time
        await asyncio.sleep(2)
        
        return {
            "success": True,
            "audio_id": audio_id,
            "audio_url": f"/api/audio/{audio_id}",
            "duration": 45.5,
            "file_size": "2.3 MB",
            "voice_used": request.get('voice', 'Sarah - Professional')
        }
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
async def render_video(request: dict):
    """Start video rendering process"""
    try:
        job_id = str(uuid.uuid4())
        
        # Store render job
        render_jobs[job_id] = {
            "id": job_id,
            "status": "queued",
            "progress": 0,
            "project_name": request.get('project_name', 'Untitled Project'),
            "export_settings": request.get('export_settings', {}),
            "timeline_data": request.get('timeline_data', {}),
            "created_at": asyncio.get_event_loop().time()
        }
        
        # Start background rendering task
        asyncio.create_task(process_video_render(job_id))
        
        return {
            "success": True,
            "job_id": job_id,
            "status": "queued",
            "message": "Video render started"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_video_render(job_id: str):
    """Background task to process video rendering"""
    try:
        job = render_jobs[job_id]
        
        # Update status to processing
        job["status"] = "processing"
        job["progress"] = 10
        await broadcast_job_update(job_id, job)
        
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
            job["progress"] = progress
            job["current_step"] = step_name
            await broadcast_job_update(job_id, job)
        
        # Mark as completed
        job["status"] = "completed"
        job["download_url"] = f"/api/download/{job_id}"
        job["file_size"] = "45.2 MB"
        await broadcast_job_update(job_id, job)
        
    except Exception as e:
        job["status"] = "failed"
        job["error"] = str(e)
        await broadcast_job_update(job_id, job)

@app.get("/api/render-status/{job_id}")
async def get_render_status(job_id: str):
    """Get render job status"""
    if job_id not in render_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return render_jobs[job_id]

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
