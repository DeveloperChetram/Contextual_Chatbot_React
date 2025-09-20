# Production Google OAuth Fix Guide

## 🔧 **Issues Identified:**

1. **Environment Variables Missing**: Production deployments need proper environment variables
2. **Google OAuth Configuration**: Redirect URIs need to be configured for production domains
3. **CORS Configuration**: Backend needs to allow production frontend domains
4. **Backend URL**: Frontend needs to connect to production backend

## 🚀 **Step-by-Step Fix:**

### **1. Frontend Environment Variables (Vercel)**

In your Vercel dashboard, add these environment variables:

```bash
VITE_BACKEND_URL=https://your-backend-url.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### **2. Backend Environment Variables (Render)**

In your Render dashboard, add these environment variables:

```bash
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
```

### **3. Google OAuth Console Configuration**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add these **Authorized JavaScript origins**:
   ```
   https://your-frontend-domain.vercel.app
   https://your-frontend-domain.onrender.com
   ```
6. Add these **Authorized redirect URIs**:
   ```
   https://your-frontend-domain.vercel.app
   https://your-frontend-domain.onrender.com
   ```

### **4. Backend CORS Configuration**

Update your backend `app.js` to include your production domains:

```javascript
const allowedOrigins = [
  'https://your-frontend-domain.vercel.app',
  'https://your-frontend-domain.onrender.com',
  'https://contextual-chatbot-react.vercel.app',
  'https://atomic-llm.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://contextual-chatbot-react.onrender.com'
];
```

### **5. Debugging Steps**

1. **Check Browser Console**: Look for the debug logs we added
2. **Check Backend Logs**: Look for the Google auth controller logs
3. **Verify Environment Variables**: Make sure all env vars are set correctly
4. **Test Backend Health**: Visit `https://your-backend-url.onrender.com/api/health`

### **6. Common Issues & Solutions**

#### **Issue: "redirect_uri_mismatch"**
- **Solution**: Add your production domain to Google OAuth console

#### **Issue: "CORS blocked origin"**
- **Solution**: Add your frontend domain to backend CORS allowedOrigins

#### **Issue: "JWT_SECRET is not defined"**
- **Solution**: Set JWT_SECRET environment variable in Render

#### **Issue: "Network Error"**
- **Solution**: Check if VITE_BACKEND_URL is pointing to correct backend

### **7. Testing Checklist**

- [ ] Frontend environment variables set in Vercel
- [ ] Backend environment variables set in Render
- [ ] Google OAuth console configured with production domains
- [ ] Backend CORS allows production frontend domain
- [ ] Backend health endpoint accessible
- [ ] Google login works in production

## 🔍 **Debug Information**

The enhanced logging will show:
- Environment mode (production/development)
- Backend URL being used
- Google OAuth response
- JWT token generation
- Redux state updates
- Navigation attempts

Check browser console and backend logs for detailed debugging information.
