import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from '../components/Login'
import Register from '../components/Register'
import ChatInterface from '../components/ChatInterface'
import { useSelector } from 'react-redux'
import AuthRoute from './AuthRoute'

const MainRoutes = () => {

  return (
    <Routes>

      <Route path='/' element={<AuthRoute><ChatInterface /></AuthRoute>} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/home' element={<AuthRoute><ChatInterface /></AuthRoute>} />
    </Routes>
  )
}

export default MainRoutes
