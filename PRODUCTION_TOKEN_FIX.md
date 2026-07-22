# Production Token Fix - Comprehensive Guide

## 🚨 Current Issue

**Error**: "Socket Connection Error: Invalid token: jwt malformed"
**Environment**: Production only (works in local development)
**Root Cause**: Token authentication failing in production WebSocket connections

## 🔍 Deep Analysis

### Why It Works Locally But Not in Production

1. **Local Development**:
   - Same domain for frontend and backend
   - HTTP-only cookies work reliably
   - CORS is more permissive
   - No cross-origin restrictions

2. **Production Issues**:
   - Different domains (frontend.vercel.app → backend.onrender.com)
   - HTTP-only cookies may not be sent with WebSocket connections
   - CORS restrictions apply strictly
   - Mixed content security policies
   - Token may not be properly stored/retrieved

## 🛠️ Comprehensive Fix

### 1. Backend Token Response Fix

**File**: `backend/src/controllers/googleAuth.controller.js`

```javascript
// Ensure BOTH cookie and response include token
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5d" });

// Set as HTTP-only cookie (for REST API calls)
res.cookie("token", token, cookieOptions);

// Include in response (for WebSocket authentication)
res.status(200).json({
    message: "success",
    user: userData,
    token: token // ⭐️ CRITICAL: Include token in response
});
```

### 2. Frontend Token Handling Fix

**File**: `frontend/src/components/GoogleLogin.jsx`

```javascript
const handleGoogleLogin = async(credentialResponse) => {
    try {
        const { data } = await axios.post('auth/google-credential', {
            credential: credentialResponse.credential
        });

        if(data.message === 'success' && data.user){
            // ⭐️ CRITICAL: Always save token from response
            if (data.token) {
                localStorage.setItem('token', data.token);
                console.log("✅ Token saved:", data.token.substring(0, 20) + "...");
            } else {
                console.error("❌ No token in response! WebSocket will fail!");
                throw new Error("Authentication failed: No token received");
            }
            
            // Save user data
            localStorage.setItem('user', JSON.stringify(data.user));
            dispatch(loginSuccess(data.user));
            navigate('/home');
        }
    } catch (error) {
        console.error('Google Login Error:', error);
        dispatch(loginFailure(error.message || 'Google login failed'));
    }
}
```

### 3. WebSocket Token Transmission Fix

**Files**: Both socket initialization components

```javascript
// ⭐️ CRITICAL: Get token BEFORE creating socket
const token = localStorage.getItem('token');
console.log("🔑 Using token for WebSocket:", token ? "present" : "MISSING");

const newSocket = io(socketUrl, {
    withCredentials: true, // For cookie fallback
    auth: { token },      // Primary method
    extraHeaders: {       // Secondary method
        'Authorization': token ? `Bearer ${token}` : ''
    }
});
```

### 4. Backend Socket Authentication Fix

**File**: `backend/src/sockets/socket.server.js`

```javascript
io.use(async (socket, next) => {
    try {
        // ⭐️ Try multiple token sources in order of reliability
        let token = socket.handshake.auth?.token || 
                   socket.handshake.headers?.authorization?.split(' ')[1];
        
        // Fallback to cookies (works in development)
        if (!token && socket.handshake.headers?.cookie) {
            const cookies = cookie.parse(socket.handshake.headers.cookie);
            token = cookies.token;
        }
        
        if (!token) {
            console.error("❌ No token found in socket handshake");
            return next(new Error("Unauthorized: Token not found"));
        }
        
        console.log("🔑 Socket auth with token:", token.substring(0, 10) + "...");
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select("credits");
        
        if (!user) return next(new Error("Unauthorized: User not found"));
        
        socket.user = user;
        next();
    } catch (error) {
        console.error("💥 Socket auth error:", error.message);
        next(new Error("Invalid token: " + error.message));
    }
});
```

## 🧪 Production Testing Guide

### Step 1: Verify Token After Login

```javascript
// After Google login, run in browser console:
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

**Expected**: Valid JWT token (starts with "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")

### Step 2: Check Socket Connection

```javascript
// When socket connects, check in browser console:
socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    console.log('🔑 Socket auth:', socket.auth);
});

socket.on('connect_error', (err) => {
    console.error('❌ Socket error:', err.message);
});
```

### Step 3: Verify Backend Logs

Check your backend logs for:
```
🔑 Socket auth with token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
User connected: [user ID]
```

### Step 4: Test Chat Functionality

1. Send a test message
2. Verify response comes back
3. Check browser network tab for WebSocket messages

## 🔍 Debugging Production Issues

### Common Production-Specific Problems

**Problem 1**: Token not saved in localStorage
- **Cause**: Google login response not containing token
- **Fix**: Check backend response in browser network tab

**Problem 2**: Token saved but not sent with socket
- **Cause**: Race condition or timing issue
- **Fix**: Add delay before socket initialization

**Problem 3**: Token sent but backend rejects it
- **Cause**: JWT secret mismatch or token format issue
- **Fix**: Verify JWT_SECRET matches between frontend/backend

**Problem 4**: CORS blocking socket connection
- **Cause**: Missing production URL in allowedOrigins
- **Fix**: Add production frontend URL to cors.js

### Debugging Checklist

1. ✅ **Token in response**: Check network tab for Google login response
2. ✅ **Token in localStorage**: Verify with `localStorage.getItem('token')`
3. ✅ **Token sent with socket**: Check socket initialization
4. ✅ **Token received by backend**: Check backend logs
5. ✅ **User authenticated**: Check `socket.user` in backend
6. ✅ **CORS configured**: Verify production URL in allowedOrigins

## 🛡️ Security Considerations

### Token Storage
- ✅ HTTP-only cookies for REST API (secure)
- ✅ localStorage for WebSocket (necessary for cross-domain)
- ⚠️ localStorage is accessible via JavaScript (XSS risk)
- ⭐️ Mitigation: Implement XSS protection headers

### Recommended Security Headers

Add to your backend:
```javascript
// Security middleware
app.use((req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://*.googleapis.com wss://your-backend.com; frame-src 'self' https://accounts.google.com;");
    next();
});
```

## 🎯 Deployment Checklist

### Before Deployment
- ✅ Test Google login locally
- ✅ Verify token in localStorage
- ✅ Test WebSocket connection locally
- ✅ Test chat functionality locally
- ✅ Check all console logs for errors

### Production Deployment
1. **Deploy backend first**
   ```bash
   cd backend
   git pull origin main
   npm install
   npm run build
   pm2 restart backend
   ```

2. **Verify backend health**
   ```bash
   curl https://your-backend.com/api/health
   # Should return: {"status":"OK","timestamp":"..."}
   ```

3. **Deploy frontend**
   ```bash
   cd frontend
   git pull origin main
   npm install
   npm run build
   ```

4. **Test production immediately**
   - Open incognito window
   - Login with Google
   - Check console logs
   - Test chat functionality

### Post-Deployment Monitoring
- ✅ Check backend logs for errors
- ✅ Monitor socket connections
- ✅ Test multiple browsers (Chrome, Firefox, Safari)
- ✅ Test mobile devices
- ✅ Verify no console errors

## 🚀 Expected Results

After implementing all fixes:

✅ **Google login works in production**
✅ **Token properly saved in localStorage**
✅ **WebSocket connects successfully**
✅ **Real-time chat works reliably**
✅ **Agent chat functionality restored**
✅ **No more "jwt malformed" errors**

The complete authentication flow should work seamlessly in production:

1. User visits site → Google One Tap appears
2. User clicks Google login → Token generated on backend
3. Token returned in response AND set as cookie
4. Frontend saves token to localStorage
5. WebSocket initialized with token from localStorage
6. Backend verifies token and authenticates socket
7. Real-time communication works perfectly!

## 📚 Additional Resources

### JWT Debugging Tools
- [jwt.io](https://jwt.io/) - Decode and verify JWT tokens
- Browser extensions: "JSON Web Token" for Chrome/Firefox

### WebSocket Testing Tools
- Browser dev tools: Network → WS tab
- [wscat](https://github.com/websockets/wscat) - CLI WebSocket client

### CORS Testing
- Browser dev tools: Console for CORS errors
- [test-cors.org](https://www.test-cors.org/) - Online CORS tester

This comprehensive fix addresses all the production-specific issues with WebSocket authentication. The key is ensuring the token is properly transmitted through multiple channels (response body, cookies, socket auth) to handle all browser and network configurations.