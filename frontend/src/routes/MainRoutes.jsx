import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Login from '../components/Login'
import Register from '../components/Register'
import ChatInterface from '../components/ChatInterface'
import NotFound from '../components/NotFound'
import { useSelector } from 'react-redux'
import AuthRoute from './AuthRoute'

const MainRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <Routes>
      {/* Protected routes */}
      <Route
        path="/"
        element={
          <AuthRoute>
            <ChatInterface />
          </AuthRoute>
        }
      />
      <Route
        path="/home"
        element={
          <AuthRoute>
            <ChatInterface />
          </AuthRoute>
        }
      />

      {/* Public routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Register />
        }
      />

      {/* Catch-all: show 404 page for unknown routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default MainRoutes
