# FilmFusion Deployment Guide

## Backend Deployment (Railway)

1. **Create Railway Account**: Sign up at [railway.app](https://railway.app)

2. **Deploy Backend**:
   \`\`\`bash
   cd backend
   railway login
   railway init
   railway up
   \`\`\`

3. **Set Environment Variables** in Railway dashboard:
   \`\`\`
   OPENAI_API_KEY=your_openai_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=your_jwt_secret_key
   CORS_ORIGINS=https://your-vercel-app.vercel.app
   \`\`\`

4. **Get Railway URL**: Copy your Railway app URL (e.g., `https://filmfusion-production-16fd.up.railway.app`)

## Frontend Deployment (Vercel)

1. **Update Environment Variables** in Vercel dashboard:
   \`\`\`
   NEXT_PUBLIC_BACKEND_URL=https://filmfusion-production-16fd.up.railway.app
   \`\`\`

2. **Deploy**: Push to GitHub and Vercel will auto-deploy

## Required API Keys

### OpenAI API
- Go to [platform.openai.com](https://platform.openai.com)
- Create API key for script generation
- Add to Railway environment variables

### ElevenLabs API  
- Go to [elevenlabs.io](https://elevenlabs.io)
- Create API key for voice synthesis
- Add to Railway environment variables

### Database Setup
- Railway PostgreSQL database is automatically configured
- Set DATABASE_URL in Railway environment variables
- JWT_SECRET for user authentication

## Testing the Integration

1. Deploy backend to Railway with PostgreSQL database
2. Update `NEXT_PUBLIC_BACKEND_URL` in Vercel
3. Test script generation, voiceover, and rendering features
4. Monitor Railway logs for any issues

## Production Checklist

- [x] Railway backend deployed with PostgreSQL database
- [x] Frontend configured with Railway backend URL
- [ ] OpenAI API key configured in Railway
- [ ] ElevenLabs API key configured in Railway
- [ ] JWT_SECRET configured in Railway
- [ ] CORS origins properly set
- [ ] All features tested end-to-end
