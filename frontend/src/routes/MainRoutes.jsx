import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from '../components/Login'
import Register from '../components/Register'
import ChatInterface from '../components/ChatInterface'

const MainRoutes = () => {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/home' element={<ChatInterface />} />
    </Routes>
  )
}

export default MainRoutes
