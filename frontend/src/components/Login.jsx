// frontend/src/components/Login.jsx
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/actions/authActions'; // Updated import
import { useEffect } from 'react';

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

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit(submitHandler)}>
        <div className="auth-header">
          {error && <h2 style={{ fontSize: '1rem', color: 'red' }}>{error}</h2>}
          <h2>Welcome Back</h2>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input {...register('email')} type="email" id="email" placeholder="Enter your email" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input {...register('password')} type="password" id="password" placeholder="Enter your password" />
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;