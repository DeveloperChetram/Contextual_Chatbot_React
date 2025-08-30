import React, { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthRoute from './AuthRoute';
import TypingIndicator from '../components/TypingIndicator'; 

const Login = lazy(() => import('../components/Login'));
const Register = lazy(() => import('../components/Register'));
const ChatInterface = lazy(() => import('../components/ChatInterface'));
const NotFound = lazy(() => import('../components/NotFound'));

const MainRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Suspense fallback={<TypingIndicator />}>
      <Routes>

        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/" element={<ChatInterface />} />
        <Route path="/home" element={<ChatInterface />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
  
};

export default MainRoutes;