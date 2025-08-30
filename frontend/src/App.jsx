import React, { useEffect } from 'react';
import MainRoutes from './routes/MainRoutes';
import { useDispatch } from 'react-redux';
import { setUserFromStorage } from '../src/redux/reducers/authSlice';
import { clearChatStore } from '../src/redux/reducers/chatSlice';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearChatStore());
    
    const user = localStorage.getItem('user');
    if (user) {
      dispatch(setUserFromStorage(JSON.parse(user)));
    }
  }, [dispatch]);

  return (
    <div>
      <MainRoutes />
    </div>
  );
};

export default App;