# FilmFusion Backend API

Railway deployment for FilmFusion's backend services.

## Features

- **AI Script Generation** - OpenAI integration for script creation
- **AI Voiceover** - ElevenLabs integration for voice synthesis  
- **Video Processing** - FFmpeg-based video rendering
- **File Management** - Media upload and storage
- **Real-time Updates** - WebSocket progress tracking

## Deployment

1. Connect your GitHub repo to Railway
2. Set environment variables:
   - `OPENAI_API_KEY`
   - `ELEVENLABS_API_KEY` 
   - `CORS_ORIGINS`
3. Deploy automatically from main branch

## API Endpoints

- `POST /api/generate-script` - Generate AI scripts
- `POST /api/generate-voiceover` - Create AI voiceovers
- `POST /api/upload-media` - Upload media files
- `POST /api/render-video` - Start video rendering
- `GET /api/render-status/{job_id}` - Check render progress
- `WS /ws/{client_id}` - Real-time updates

## Local Development

\`\`\`bash
pip install -r requirements.txt
uvicorn main:app --reload
