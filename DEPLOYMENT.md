# Deployment Configuration Guide

## Mobile Compatibility Fix

The main issue causing "Internal Server Error" on mobile devices was that the frontend was hardcoded to connect to `localhost:3001`, which mobile devices cannot access.

## Required Changes

### 1. Environment Variables

In your Vercel deployment, you need to set the following environment variable:

```
VITE_BACKEND_URL=https://your-backend-domain.com/api
```

Replace `your-backend-domain.com` with your actual backend domain (e.g., your Render.com domain).

### 2. CORS Configuration

Update the CORS allowed origins in your backend to include your Vercel domain:

```javascript
const allowedOrigins = [
  'https://contextual-chatbot-react.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://contextual-chatbot-react.onrender.com',
  'https://your-actual-vercel-domain.vercel.app' // Add your actual Vercel domain
];
```

### 3. Vercel Environment Variables Setup

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add: `VITE_BACKEND_URL` = `https://your-backend-domain.com/api`
5. Redeploy your application

## Testing

After making these changes:
1. Deploy the updated code
2. Test on mobile devices
3. Check browser console for any remaining CORS or connection errors

## Common Issues

- **CORS errors**: Make sure your backend domain is in the allowed origins list
- **Socket connection errors**: Ensure the WebSocket URL is correctly formatted (without /api)
- **Environment variables not loading**: Make sure to redeploy after adding environment variables
