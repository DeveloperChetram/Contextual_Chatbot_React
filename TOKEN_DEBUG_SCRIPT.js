// TOKEN DEBUG SCRIPT - Run this in browser console to diagnose token issues
// =======================================================================

console.log('🔍 Starting Token Debug Script...');

// 1. Check localStorage
console.log('\n📦 localStorage Contents:');
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));

// 2. Check if token is valid JWT format
const token = localStorage.getItem('token');
if (token) {
    console.log('\n🔑 Token Analysis:');
    console.log('Length:', token.length);
    console.log('Starts with "ey":', token.startsWith('ey'));
    console.log('Has dots (JWT format):', token.split('.').length === 3);
    
    // Try to decode token (client-side only, no verification)
    try {
        const [header, payload] = token.split('.');
        const decodedHeader = JSON.parse(atob(header));
        const decodedPayload = JSON.parse(atob(payload));
        console.log('Decoded Header:', decodedHeader);
        console.log('Decoded Payload:', decodedPayload);
    } catch (e) {
        console.error('❌ Token decode failed:', e.message);
    }
} else {
    console.error('❌ NO TOKEN FOUND IN localStorage!');
}

// 3. Check current socket connection
if (window.socket) {
    console.log('\n🔌 Current Socket:');
    console.log('Connected:', window.socket.connected);
    console.log('Socket ID:', window.socket.id);
    console.log('Auth data:', window.socket.auth);
    
    window.socket.on('connect', () => {
        console.log('✅ Socket connected:', window.socket.id);
    });
    
    window.socket.on('connect_error', (err) => {
        console.error('❌ Socket error:', err.message);
    });
} else {
    console.log('\n🔌 No socket connection found');
}

// 4. Test manual socket connection
console.log('\n🧪 Testing Manual Socket Connection...');
const testToken = localStorage.getItem('token');
const backendUrl = window.import.meta.env.VITE_BACKEND_URL || `https://${window.location.hostname}`;
const socketUrl = backendUrl.replace('/api', '');

console.log('Backend URL:', backendUrl);
console.log('Socket URL:', socketUrl);
console.log('Using token:', testToken ? 'present' : 'MISSING');

if (testToken) {
    const testSocket = io(socketUrl, {
        withCredentials: true,
        auth: { token: testToken },
        extraHeaders: {
            'Authorization': `Bearer ${testToken}`
        }
    });
    
    testSocket.on('connect', () => {
        console.log('✅ Test socket connected successfully!');
        testSocket.disconnect();
    });
    
    testSocket.on('connect_error', (err) => {
        console.error('❌ Test socket failed:', err.message);
    });
} else {
    console.error('❌ Cannot test socket - no token available');
}

// 5. Check network requests
console.log('\n🌐 Recent Network Requests:');
// Note: This requires checking the network tab manually
console.log('Please check browser Network tab for:');
console.log('1. Google login POST request to /auth/google-credential');
console.log('2. Response should include token field');
console.log('3. WebSocket connection should show in WS tab');

// 6. Summary and recommendations
console.log('\n📋 DEBUG SUMMARY:');
if (!token) {
    console.log('💥 CRITICAL: No token found!');
    console.log('🔧 Check backend response for Google login');
    console.log('🔧 Ensure backend includes token in JSON response');
} else if (token && token.length < 100) {
    console.log('⚠️ WARNING: Token seems too short');
    console.log('🔧 Check if token is being truncated');
    console.log('🔧 Verify JWT_SECRET is properly set');
} else if (token && !token.startsWith('ey')) {
    console.log('⚠️ WARNING: Token doesn\'t start with "ey" (JWT format)');
    console.log('🔧 Check token generation in backend');
} else {
    console.log('✅ Token appears valid');
    console.log('🔧 If socket still fails, check:');
    console.log('   - CORS configuration');
    console.log('   - JWT_SECRET consistency');
    console.log('   - Socket authentication middleware');
}

console.log('\n🛠️ RECOMMENDED FIXES:');
console.log('1. Ensure backend returns token in JSON response');
console.log('2. Verify token is saved to localStorage');
console.log('3. Check socket sends token via auth parameter');
console.log('4. Add debug logs to backend socket middleware');
console.log('5. Test with incognito window (no cache issues)');

console.log('\n📚 DEBUG SCRIPT COMPLETE');