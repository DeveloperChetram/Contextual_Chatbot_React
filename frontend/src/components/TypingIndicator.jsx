import React from 'react';
import '../styles/TypingIndicator.css';

const TypingIndicator = () => {
  return (
    <div className="chat-turn model">
      <div className="message-header">
        <h3 className="message-sender">Model</h3>
      </div>
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default TypingIndicator;