import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/actions/authActions';
import { useEffect, useState, memo, useCallback } from 'react';
import { resetAuthState } from '../redux/reducers/authSlice';
import ThemeToggler from './ThemeToggler';
import { useAuthState } from '../hooks/useOptimizedSelectors';
import GLogin from './GoogleLogin';

const Login = memo(() => {
  const user = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAuthState();
  const { register, handleSubmit, reset } = useForm();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = useCallback(async (data) => {
    const result = await loginUser(dispatch, data);
    if (result.success) {
      reset();
    }
  }, [dispatch, reset]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

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
        
        {/* Google Login Button */}
        <GLogin />
        
        {/* Divider */}
        <div className="auth-divider">
          <span>or</span>
        </div>
        
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
          <div className="password-input-container">
            <input
              {...register('password')}
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Password"
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </div>
  );
});

Login.displayName = 'Login';

export default Login;