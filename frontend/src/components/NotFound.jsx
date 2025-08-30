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
        <div className="cat-gif-container">
          <img 
            src="https://i.pinimg.com/736x/e8/cf/bb/e8cfbb0e37ebef791b1c98299465e635.jpg" 
            alt="Confused cat"
            className="cat-gif"
          />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
