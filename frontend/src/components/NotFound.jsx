import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-description">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="error-actions">
          <button className="btn-primary" onClick={handleGoHome}>
            Go Home
          </button>
          <button className="btn-secondary" onClick={handleGoBack}>
            Go Back
          </button>
        </div>
        <div className="error-help">
          <p>You can also try:</p>
          <ul>
            <li>Checking the URL for typos</li>
            <li>Using the navigation menu</li>
            <li>Starting a new chat</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
