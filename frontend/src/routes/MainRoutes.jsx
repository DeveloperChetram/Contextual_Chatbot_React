import React, { Suspense, lazy, memo } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import TypingIndicator from '../components/TypingIndicator';
import ErrorBoundary from '../components/ErrorBoundary';

const Login = lazy(() => import('../components/Login'));
const Register = lazy(() => import('../components/Register'));
const ChatInterface = lazy(() => import('../components/ChatInterface'));
const NotFound = lazy(() => import('../components/NotFound'));
const ProfilePage = lazy(() => import('../components/ProfilePage'));

const LoadingFallback = memo(() => <TypingIndicator />);

const MainRoutes = memo(() => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ChatInterface />} />
          <Route path="/home" element={<ChatInterface />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
});

MainRoutes.displayName = 'MainRoutes';
export default MainRoutes;