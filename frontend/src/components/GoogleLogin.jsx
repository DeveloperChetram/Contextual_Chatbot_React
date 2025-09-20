import React from 'react'
import { useGoogleLogin } from '@react-oauth/google';
import {axiosInstance as axios} from '../api/axios';
import { useDispatch } from 'react-redux';
import { loginSuccess, loginFailure } from '../redux/reducers/authSlice';
import { useNavigate } from 'react-router-dom';

const GLogin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogleLogin = async(authResult) => {
        try {
            console.log("=== Google Login Debug ===");
            console.log("Environment:", import.meta.env.MODE);
            console.log("Backend URL:", axios.defaults.baseURL);
            console.log("Auth Result:", authResult);
            
            const {data} = await axios.get(`auth/google-auth?code=${authResult.access_token}`);
            console.log("Backend Response:", data);
            console.log("Response has token:", !!data.token);
            console.log("Response has user:", !!data.user);
            console.log("Response message:", data.message);
            
            if(data.message === 'success' && data.user){
                console.log("Login successful, processing user data...");
                
                const loginPayload = {
                    createdAt: data.user.createdAt,
                    credits: data.user.credits,
                    email: data.user.email,
                    fullName: {
                        firstName: data.user.fullName.firstName,
                        lastName: data.user.fullName.lastName
                    },
                    updatedAt: data.user.updatedAt,
                    _id: data.user._id,
                }
                
                console.log("Login payload:", loginPayload);
                
                // Save to localStorage
                localStorage.setItem('user', JSON.stringify(loginPayload));
                
                // Save token if available, otherwise use a placeholder
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    console.log("Token saved to localStorage");
                } else {
                    console.warn("No token received from backend, using placeholder");
                    localStorage.setItem('token', 'google-auth-token');
                }
                
                // Update Redux state
                dispatch(loginSuccess(loginPayload));
                
                console.log("Redux state updated, navigating to /home");
                
                // Navigate to home
                navigate('/home');
                
                console.log("Navigation completed");
            } else {
                console.error("Invalid response format:", data);
                console.error("Missing fields:", {
                    message: data.message,
                    hasUser: !!data.user,
                    hasToken: !!data.token
                });
                dispatch(loginFailure('Invalid response from server'));
            }
        }
        catch (error) {
            console.error('=== Google Login Error ===');
            console.error('Error details:', error);
            console.error('Error response:', error.response);
            console.error('Error message:', error.message);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            
            const errorMessage = error.response?.data?.error || error.message || 'Google login failed';
            dispatch(loginFailure(errorMessage));
        }
    }

    const login = useGoogleLogin({
        onSuccess: handleGoogleLogin,
        onError: (error) => {
            console.error('Google login error:', error);
            dispatch(loginFailure('Google login failed'));
        },
    })

    return (
        <button 
            type="button"
            className="google-login-btn" 
            onClick={login}
        >
            <svg className="google-icon" width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
        </button>
    )
}

export default GLogin