import React, { useEffect, useMemo, useCallback } from 'react';
import MainRoutes from './routes/MainRoutes';
import { useDispatch } from 'react-redux';
import { setUserFromStorage } from '../src/redux/reducers/authSlice';
import { clearChatStore } from '../src/redux/reducers/chatSlice';
import { getCurrentUser } from '../src/redux/actions/authActions';
import { GoogleOAuthProvider } from "@react-oauth/google";
  // import { useGoogleLogin } from '@react-oauth/google';
import { useAuthState, useChatState } from './hooks/useOptimizedSelectors';
import GLogin from './components/GoogleLogin';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import './styles/PWAInstallPrompt.css';
import { updatePWAThemeColor } from './utils/pwaThemeUpdater';
// import { useGoogleLogin } from "@react-oauth/google";
// import { useGoogleLogout } from "@react-oauth/google";
// import PrivateRoute from "./components/PrivateRoute";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuthState();
  const { character } = useChatState();

  // Memoize the Google OAuth client ID to prevent unnecessary re-renders
  const googleClientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID, []);

  // Memoize the initialization function to prevent unnecessary re-runs
  const initializeApp = useCallback(() => {
    dispatch(clearChatStore());
    
    // Check if user exists in localStorage
    const user = localStorage.getItem('user');
    if (user) {
      // Validate the token with the backend
      getCurrentUser(dispatch);
    }
  }, [dispatch]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    document.body.dataset.character = character;
    
    // Update PWA theme color based on character
    updatePWAThemeColor(character);
  }, [character]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <MainRoutes />
      <PWAInstallPrompt />
    </GoogleOAuthProvider>
  );
};

export default App;