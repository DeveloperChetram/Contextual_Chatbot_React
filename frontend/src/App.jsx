import React, { useEffect } from 'react'
import ChatInterface from './components/ChatInterface'
import MainRoutes from './routes/MainRoutes'
import { useDispatch } from 'react-redux'
import { getCurrenctUser } from './redux/actions/authActions'

const App = () => {
const   dispatch = useDispatch()
  useEffect(()=>{
dispatch(getCurrenctUser())
  },[dispatch])
  return (
    <div>
      {/* <ChatInterface /> */}
      <MainRoutes />
    </div>
  )
}

export default App
