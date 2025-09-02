import React from 'react';
import '../styles/ChatLoadingAnimation.css';

const ChatLoadingAnimation = () => {
  return (
    <div className="chat-loading-container">
      <div className="chat-loading-content">
        <div className="chat-loading-icon">
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
        <div className="chat-loading-text">
          <h3>Creating your chat...</h3>
          <p>Please wait while we set up your new conversation</p>
        </div>
      </div>
    </div>
  );
};

export default ChatLoadingAnimation;
