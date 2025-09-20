import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const AuthRoute = (props) => {
    const userData = useSelector((state)=>state.auth)
  return (
   userData.isAuthenticated ? props.children: <Navigate to='/login' />
  ) 
}

export default AuthRoute
