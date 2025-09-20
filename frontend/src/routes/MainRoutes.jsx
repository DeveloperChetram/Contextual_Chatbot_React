import React, { Suspense, lazy, memo } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import AuthRoute from './AuthRoute';
import TypingIndicator from '../components/TypingIndicator';
import ErrorBoundary from '../components/ErrorBoundary';
import { useAuthState } from '../hooks/useOptimizedSelectors'; 

// Lazy load components with better error boundaries
const Login = lazy(() => import('../components/Login'));
const Register = lazy(() => import('../components/Register'));
const ChatInterface = lazy(() => import('../components/ChatInterface'));
const NotFound = lazy(() => import('../components/NotFound'));

// Memoize the loading component
const LoadingFallback = memo(() => <TypingIndicator />);

const MainRoutes = memo(() => {
  const { isAuthenticated } = useAuthState();

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={   <Login />} />
          <Route path="/register" element={ <Register />} />
          <Route path="/" element={ <ChatInterface /> } />
          <Route path="/home" element={ <ChatInterface /> } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
});

MainRoutes.displayName = 'MainRoutes';

export default MainRoutes;