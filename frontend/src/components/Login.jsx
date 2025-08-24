import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import { useForm } from 'react-hook-form';
import { loginUserAction } from '../redux/actions/authActions';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

const Login = () => {
  const navigate = useNavigate()
  const userData = useSelector((state)=>state.auth)
  const {register, handleSubmit, reset} = useForm()
  const dispatch = useDispatch()
  const submitHnadler = (data)=>{
    dispatch(loginUserAction(data))

    reset()
  }
   useEffect(()=>{
        if(userData.isAuthenticated){
          navigate('/home')
      }
    },[userData, navigate])
  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit(submitHnadler)} >
        <div className="auth-header">
          <h2>{userData.loading?"logging in":"message"}</h2>
          <h2>Welcome Back</h2>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input {...register('email')} type="email" id="email" placeholder="Enter your email" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input {...register('password')}  type="password" id="password" placeholder="Enter your password" />
        </div>
        <button type="submit" className="auth-button">Login</button>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;