import React, { memo } from 'react';
import ThemeToggler from '../ThemeToggler';

const Icon = memo(({ path, className = '' }) => (
    <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {path}
    </svg>
));

const ChatHeader = memo(({ activeChat, isAuthenticated, onSidebarOpen, onLogout, onLogin }) => (
    <header className="main-header">
        <div className="header-left">
            <button className="header-hamburger" onClick={onSidebarOpen}>
                <Icon path={<><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></>} />
            </button>
            <div className="header-title-wrapper">
                <h2>{activeChat?.title || 'Welcome'}</h2>
            </div>
        </div>
        <div className="header-right">
            <ThemeToggler key={`theme-${isAuthenticated}`} />
            {isAuthenticated ? (
                <button className="share-btn logout" onClick={onLogout}>Log out</button>
            ) : (
                <button className="share-btn login" onClick={onLogin}>Login</button>
            )}
        </div>
    </header>
));

ChatHeader.displayName = 'ChatHeader';
export default ChatHeader;
