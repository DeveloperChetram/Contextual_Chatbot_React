import React, { memo } from 'react';
import '../styles/TypingIndicator.css';

const TypingIndicator = memo(({ character = "AI Assistant" }) => {
  return (
    <div className="chat-turn model">
      <div className="message-header">
        <h3 className="message-sender">{character}</h3>
      </div>
      <div className="typing-indicator">
        <span className="typing-text">{character} is typing</span>
        <div className="dots-container">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

export default TypingIndicator;