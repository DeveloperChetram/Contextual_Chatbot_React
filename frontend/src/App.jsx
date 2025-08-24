import React, { useEffect } from 'react';
import MainRoutes from './routes/MainRoutes';
import { useDispatch } from 'react-redux';
import { setUserFromStorage } from '../src/redux/reducers/authSlice';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
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