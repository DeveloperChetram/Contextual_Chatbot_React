import React, { memo, useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

const Icon = memo(({ path, className = '' }) => (
    <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {path}
    </svg>
));

const MessageBubble = memo(({ msg, index, nextModelMessage, currentCharacter }) => {
    const [copied, setCopied] = useState(false);

    // For user messages, determine which character they were talking to
    const displayCharacter = msg.role === 'user'
        ? (nextModelMessage?.character || currentCharacter)
        : msg.character;

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(msg.content).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [msg.content]);

    const senderName = msg.role === 'user'
        ? 'You'
        : (msg.error ? 'AI Assistant' : (msg.character?.charAt(0).toUpperCase() + msg.character?.slice(1) || 'AI Assistant'));

    return (
        <div className={`chat-turn ${msg.role}`}>
            <div className="message-header">
                <h3
                    className="message-sender"
                    data-character={msg.error ? 'system' : displayCharacter}
                >
                    {senderName}
                </h3>
                <button className="copy-btn" onClick={handleCopy}>
                    <Icon path={copied
                        ? <path d="M20 6L9 17l-5-5" />
                        : <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>
                    } />
                </button>
            </div>
            <div className={`message-text ${msg.error ? 'error-message' : ''}`}>
                {msg.role === 'model' ? (
                    <ReactMarkdown
                        children={msg.content}
                        components={{
                            code(props) {
                                const { children, className, node, ...rest } = props;
                                const match = /language-(\w+)/.exec(className || '');
                                if (match) {
                                    return (
                                        <CodeBlock language={match[1]} messageId={msg._id} index={index}>
                                            {children}
                                        </CodeBlock>
                                    );
                                }
                                return <code {...rest} className={className}>{children}</code>;
                            },
                        }}
                    />
                ) : (
                    msg.content
                )}
            </div>
        </div>
    );
});

MessageBubble.displayName = 'MessageBubble';
export default MessageBubble;
