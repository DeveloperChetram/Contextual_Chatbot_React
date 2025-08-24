import React from 'react';
import '../styles/Auth.css';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
        <h2>Create Account</h2>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input type="text" id="firstName" placeholder="Enter your first name" />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input type="text" id="lastName" placeholder="Enter your last name" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Enter your email" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" placeholder="Enter your password" />
        </div>
        <button type="submit" className="auth-button">Register</button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;