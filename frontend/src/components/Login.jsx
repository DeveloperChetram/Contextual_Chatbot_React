import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/actions/authActions';
import { useEffect, useState } from 'react';
import { resetAuthState } from '../redux/reducers/authSlice';
import ThemeToggler from './ThemeToggler'; // Import the new component

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, reset } = useForm();
  const dispatch = useDispatch();

  const submitHandler = async (data) => {
    const result = await loginUser(dispatch, data);
    if (result.success) {
      reset();
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  return (
    <div className="auth-container">
 
      <form className="auth-form" onSubmit={handleSubmit(submitHandler)}>
        <ThemeToggler className="theme-toggle-button" />
        <div className="auth-header">
          <div className="auth-logo">
          <svg className="logo-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"> <path d="M12.48 3.52a1 1 0 0 0-1 1v2.92a1 1 0 0 0 .52.88l5.44 3.14a1 1 0 0 0 1.5-.87V7.52a1 1 0 0 0-.52-.88l-5.44-3.14a1 1 0 0 0-.5 0zM5.08 7.52a1 1 0 0 0-.52.88v2.92a1 1 0 0 0 .52.88l5.44 3.14a1 1 0 0 0 1.5-.87V11.4a1 1 0 0 0-.52-.88L6.58 7.52a1 1 0 0 0-1.5 0zM12 14.5l-5.44 3.14a1 1 0 0 0-.52.88v2.92a1 1 0 0 0 1.5.87l5.44-3.14a1 1 0 0 0 .52-.88v-2.92a1 1 0 0 0-1.5-.87z" /> </svg>
            <span>Atomic</span>
          </div>
          <h2>Welcome back</h2>
          <p>Welcome back! Please enter your details.</p>
        </div>
        {error && <p className="auth-error">{error}</p>}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            {...register('email')}
            type="email"
            id="email"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            {...register('password')}
            type="password"
            id="password"
            placeholder="Password"
            required
          />
        </div>
        {/* <a href="#" className="forgot-password">Forgot password</a> */}
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;