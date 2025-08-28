// frontend/src/components/Register.jsx
import "../styles/Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/actions/authActions"; // Updated import
import { useEffect } from "react";
import { resetAuthState } from "../redux/reducers/authSlice";

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, reset } = useForm();
  const dispatch = useDispatch();

  const submitHandler = async (data) => {
    const result = await registerUser(dispatch, {
      fullName: { firstName: data.firstName, lastName: data.lastName },
      email: data.email,
      password: data.password,
    });

    if (result.success) {
      reset();
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  // Reset loading state when component mounts
  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit(submitHandler)}>
        <div className="auth-header">
          {error && <h2 style={{ fontSize: '1rem', color: 'red' }}>{error}</h2>}
          <h2>Create Account</h2>
        </div>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            {...register("firstName")}
            type="text"
            id="firstName"
            placeholder="Enter your first name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            {...register("lastName")}
            type="text"
            id="lastName"
            placeholder="Enter your last name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            {...register("email")}
            type="email"
            id="email"
            placeholder="Enter your email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            {...register("password")}
            type="password"
            id="password"
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;