import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';

const NotFound = memo(() => {
  const navigate = useNavigate();

  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

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
});

NotFound.displayName = 'NotFound';

export default NotFound;
