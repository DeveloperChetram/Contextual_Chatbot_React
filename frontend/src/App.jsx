import React, { useEffect, useCallback } from 'react';
import MainRoutes from './routes/MainRoutes';
import { useDispatch } from 'react-redux';
import { setUserFromStorage } from '../src/redux/reducers/authSlice';
import { clearChatStore } from '../src/redux/reducers/chatSlice';
import { getCurrentUser } from '../src/redux/actions/authActions';
import { GoogleOAuthProvider } from "@react-oauth/google";
// import { useGoogleLogin } from '@react-oauth/google';
import { useChatState } from './hooks/useOptimizedSelectors';
import GLogin from './components/GoogleLogin';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import './styles/PWAInstallPrompt.css';
import { updatePWAThemeColor } from './utils/pwaThemeUpdater';
// import { useGoogleLogin } from "@react-oauth/google";
// import { useGoogleLogout } from "@react-oauth/google";
// import PrivateRoute from "./components/PrivateRoute";

function App() {
  const dispatch = useDispatch();
  const { character } = useChatState();

  const initializeApp = useCallback(() => {
    dispatch(clearChatStore());

    const stored = localStorage.getItem('user');
    if (stored) {
      try {
       
        const user = JSON.parse(stored);
        dispatch(setUserFromStorage(user));

        // verify token in the background
        getCurrentUser(dispatch);
      } catch {
        // clear iff fails
        localStorage.removeItem('user');
      }
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
      {/* <PWAInstallPrompt /> */}
    </GoogleOAuthProvider>
  );
};

export default App;