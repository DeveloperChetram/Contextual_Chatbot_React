import React, { useEffect } from 'react';
import MainRoutes from './routes/MainRoutes';
import { useDispatch } from 'react-redux';
import { setUserFromStorage } from '../src/redux/reducers/authSlice';
import { clearChatStore } from '../src/redux/reducers/chatSlice';
import { getCurrentUser } from '../src/redux/actions/authActions';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearChatStore());
    
    // Check if user exists in localStorage
    const user = localStorage.getItem('user');
    if (user) {
      // Validate the token with the backend
              getCurrentUser(dispatch);
    }
  }, [dispatch]);

  return (
    <div>
      <MainRoutes />
    </div>
  );
};

export default App;