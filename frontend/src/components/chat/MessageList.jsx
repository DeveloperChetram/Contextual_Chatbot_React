import React, { memo, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from '../TypingIndicator';
import ChatLoadingAnimation from '../ChatLoadingAnimation';
import { useNavigate } from 'react-router-dom';

const MessageList = memo(({
    messages,
    loading,
    creatingChat,
    activeChatId,
    isModelTyping,
    isAuthenticated,
    chatsCount,
    character,
}) => {
    const chatAreaRef = useRef(null);
    const navigate = useNavigate();

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages, activeChatId, isModelTyping]);

    return (
        <section className="chat-area" ref={chatAreaRef}>
            <div className="chat-content-wrapper">
                {loading && !messages.length && (
                    <div className="empty-chat-placeholder"><h2>Loading...</h2></div>
                )}

                {creatingChat && <ChatLoadingAnimation />}

                {!loading && !creatingChat && messages.length > 0 && messages.map((msg, index) => {
                    const nextModelMessage = msg.role === 'user'
                        ? messages.slice(index + 1).find(m => m.role === 'model')
                        : null;
                    return (
                        <MessageBubble
                            key={msg._id}
                            msg={msg}
                            index={index}
                            nextModelMessage={nextModelMessage}
                            currentCharacter={character}
                        />
                    );
                })}

                {isModelTyping[activeChatId] && <TypingIndicator character={character} />}

                {!loading && !creatingChat && messages.length === 0 && !isModelTyping[activeChatId] && (
                    <div className="empty-chat-placeholder">
                        {activeChatId ? (
                            <>
                                <h2>Start a new conversation</h2>
                                <p>Type your first message below.</p>
                            </>
                        ) : isAuthenticated ? (
                            chatsCount === 0 ? (
                                <>
                                    <h2>Start Your First Chat</h2>
                                    <p>Create your first chat using the sidebar to begin your conversation with Atomic.</p>
                                </>
                            ) : (
                                <>
                                    <h2>Select or create a chat to begin</h2>
                                    <p>Choose a chat from the sidebar or create a new one.</p>
                                </>
                            )
                        ) : (
                            <>
                                <h2>Welcome to Atomic</h2>
                                <p>Atomic helps you find accurate, concise and truthful answers. Login to explore more characters.</p>
                                <button className="login-to-chat-btn" onClick={() => navigate('/login')}>
                                    Login to Start Chatting
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
});

MessageList.displayName = 'MessageList';
export default MessageList;
