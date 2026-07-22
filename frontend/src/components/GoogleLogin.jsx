import React from 'react'
import { GoogleOAuthProvider, GoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google'
import {axiosInstance as axios} from '../api/axios'
import { useDispatch } from 'react-redux'
import { loginSuccess, loginFailure } from '../redux/reducers/authSlice'
import { useNavigate } from 'react-router-dom'

const GLogin = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // Define handleGoogleLogin first to avoid reference errors
    const handleGoogleLogin = async(credentialResponse) => {
        try {
            console.log("=== Modern Google Login ===")
            console.log("Using credential-based authentication")

            // Send credential directly to backend for verification
            const { data } = await axios.post('auth/google-credential', {
                credential: credentialResponse.credential
            })

            console.log("Backend Response:", data)

            if(data.message === 'success' && data.user){
                console.log("Login successful, processing user data...")

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

                console.log("Login payload:", loginPayload)

                // Save to localStorage
                localStorage.setItem('user', JSON.stringify(loginPayload))

                // Save token if available
                if (data.token) {
                    localStorage.setItem('token', data.token)
                    console.log("Token saved to localStorage")
                }

                // Update Redux state
                dispatch(loginSuccess(loginPayload))

                console.log("Redux state updated, navigating to /home")

                // Navigate to home
                navigate('/home')

                console.log("Navigation completed")
            } else {
                console.error("Invalid response format:", data)
                dispatch(loginFailure('Invalid response from server'))
            }
        }
        catch (error) {
            console.error('=== Google Login Error ===')
            console.error('Error details:', error)
            console.error('Error response:', error.response?.data)
            
            const errorMessage = error.response?.data?.message || error.message || 'Google login failed'
            dispatch(loginFailure(errorMessage))
        }
    }

    // Modern Google One Tap login for instant authentication
    useGoogleOneTapLogin({
        onSuccess: handleGoogleLogin,
        onError: (error) => {
            console.error('Google One Tap error:', error)
        },
        googleAccountConfigs: {
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        },
    })

    return (
        <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
                console.error('Google login error')
                dispatch(loginFailure('Google login failed'))
            }}
            useOneTap
            text="continue_with"
            shape="rectangular"
            theme="outline"
            size="large"
            logo_alignment="left"
        />
    )
}

// Wrap the component with GoogleOAuthProvider
const GoogleLoginWrapper = () => {
    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GLogin />
        </GoogleOAuthProvider>
    )
}

export default GoogleLoginWrapper