import "../styles/Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { registerUserAction } from "../redux/actions/authActions";
import { registerSuccess } from "../redux/reducers/authSlice";
import { useEffect } from "react";

const Register = () => {
  const navigate = useNavigate()
    const userData = useSelector((state)=>state.auth)
    console.log(userData)
  const { register, handleSubmit, reset } = useForm();
  const dispatch = useDispatch();
  const submitHandler = async (data) => {
       await  dispatch(
      registerUserAction({
        fullName: { firstName: data.firstName, lastName: data.lastName },
        email: data.email,
        password: data.password,
      })
    );
    reset();
  };

    useEffect(()=>{
      if(userData.isAuthenticated){
        navigate('/home')
    }
  },[userData, navigate])
  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit(submitHandler)}>
        <div className="auth-header">
            <h2>{userData.loading? "loading":"message"}</h2>
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
        <button type="submit" className="auth-button">
          Register
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
