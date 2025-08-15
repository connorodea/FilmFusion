# FilmFusion Backend API

Railway deployment for FilmFusion's backend services with advanced AI reasoning capabilities.

## Features

- **AI Script Generation** - OpenAI integration with reasoning models for enhanced script creation
- **AI Voiceover** - ElevenLabs integration for voice synthesis  
- **Video Processing** - FFmpeg-based video rendering
- **File Management** - Media upload and storage
- **Real-time Updates** - WebSocket progress tracking
- **Advanced Reasoning** - GPT-5 reasoning models for complex video planning and analysis
- **Multi-Agent Orchestration** - Intelligent workflow management with specialized AI agents
- **Visual Analysis** - Advanced image and visual content analysis
- **Content Evaluation** - AI-powered content quality assessment and optimization

## Deployment

1. Connect your GitHub repo to Railway
2. Set environment variables:
   - `OPENAI_API_KEY` - Required for all AI features
   - `ELEVENLABS_API_KEY` - Required for voiceover generation
   - `CORS_ORIGINS` - Frontend URL for CORS
3. Deploy automatically from main branch

## API Endpoints

### Core Features
- `POST /api/generate-script` - Generate AI scripts (supports reasoning models)
- `POST /api/generate-voiceover` - Create AI voiceovers
- `POST /api/upload-media` - Upload media files
- `POST /api/render-video` - Start video rendering
- `GET /api/render-status/{job_id}` - Check render progress
- `WS /ws/{client_id}` - Real-time updates

### Advanced AI Features
- `POST /api/reasoning/plan-video` - Complex video planning with reasoning models
- `POST /api/reasoning/analyze-content` - Deep content analysis and optimization
- `POST /api/reasoning/visual-analysis` - Visual content analysis with image support
- `POST /api/reasoning/debug-workflow` - Workflow debugging and optimization
- `POST /api/reasoning/multi-agent-orchestration` - Multi-agent project management
- `POST /api/reasoning/evaluate-content` - Expert-level content evaluation

### Utility Features
- `POST /api/generate-image` - AI image generation
- `POST /api/process-data` - Code interpreter for data processing
- `GET /api/images/{image_id}` - Serve generated images
- `GET /api/audio/{audio_id}` - Serve generated audio files

## Reasoning Models

The backend supports OpenAI's advanced reasoning models (GPT-5, o-series) for:

- **Complex Problem Solving** - Multi-step video creation strategies
- **Visual Reasoning** - Advanced image and thumbnail analysis
- **Content Optimization** - Platform-specific content enhancement
- **Workflow Debugging** - Intelligent process optimization
- **Multi-Agent Coordination** - Orchestrating specialized AI agents

### Usage Examples

**Video Planning:**
\`\`\`json
{
  "topic": "Product launch video",
  "audience": "tech professionals",
  "platform": "LinkedIn",
  "duration": "3 minutes",
  "reasoning_effort": "high"
}
\`\`\`

**Content Analysis:**
\`\`\`json
{
  "script": "Your video script here...",
  "platform": "YouTube",
  "performance_data": "Current metrics..."
}
\`\`\`

**Visual Analysis:**
\`\`\`json
{
  "image_data": "base64_encoded_image",
  "context": "Video thumbnail",
  "platform": "Instagram"
}
\`\`\`

## Local Development

\`\`\`bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
\`\`\`

## Environment Variables

- `OPENAI_API_KEY` - OpenAI API key for reasoning models and GPT
- `ELEVENLABS_API_KEY` - ElevenLabs API key for voice synthesis
- `CORS_ORIGINS` - Comma-separated list of allowed origins
- `PORT` - Server port (default: 8000)

## Model Selection Strategy

The backend intelligently selects models based on task complexity:

- **Reasoning Models (GPT-5)** - Complex planning, analysis, debugging
- **GPT Models (GPT-4.1)** - Fast execution, straightforward tasks
- **Hybrid Approach** - Reasoning for planning, GPT for execution

This optimizes both quality and cost while maintaining high performance.
