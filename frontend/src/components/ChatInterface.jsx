import React, { useState } from 'react';
import '../styles/ChatInterface.css';

// A more robust Icon component that accepts SVG path data
const Icon = ({ path, className = '' }) => (
  <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

// Dedicated Logo SVG Component
const LogoIcon = () => (
    <svg className="logo-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.48 3.52a1 1 0 0 0-1 1v2.92a1 1 0 0 0 .52.88l5.44 3.14a1 1 0 0 0 1.5-.87V7.52a1 1 0 0 0-.52-.88l-5.44-3.14a1 1 0 0 0-.5 0zM5.08 7.52a1 1 0 0 0-.52.88v2.92a1 1 0 0 0 .52.88l5.44 3.14a1 1 0 0 0 1.5-.87V11.4a1 1 0 0 0-.52-.88L6.58 7.52a1 1 0 0 0-1.5 0zM12 14.5l-5.44 3.14a1 1 0 0 0-.52.88v2.92a1 1 0 0 0 1.5.87l5.44-3.14a1 1 0 0 0 .52-.88v-2.92a1 1 0 0 0-1.5-.87z"/>
    </svg>
);

const ChatInterface = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const libraryItems = [
    { text: 'hello', active: true },
    { text: '/* theme.css */ /* Impor' },
    { text: 'Search all major job boa' },
    { text: '<DOCTYPE html> <htm>' },
    { text: 'Search all major job boa' },
    { text: 'how to invest in eSports' },
    { text: 'can you find me dairy fr' },
    { text: "Israel's Defense Ministry" },
    { text: 'search this news and gi' },
    { text: 'turn him into alien' },
  ];

  return (
    <div className="chat-container">
       <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
         <Icon path={<><path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" /></>} />
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="logo-container">
            <LogoIcon />
          </div>
          <nav className="main-nav">
             <button className="new-thread-btn">
                <Icon path={<path d="M12 5v14m-7-7h14" />} />
                <span>New Thread</span>
            </button>
            <ul>
              <li><a href="#"><Icon path={<><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>} /> <span>Finance</span></a></li>
              <li><a href="#"><Icon path={<><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></>} /> <span>Travel</span></a></li>
              <li><a href="#"><Icon path={<><path d="m22 9-1.5-1.5L18 10l-2.5-2.5L13 10V3H4v18h16V9z" /></>} /> <span>Academic</span></a></li>
            </ul>
          </nav>
        </div>

        <div className="library">
          <div className="library-header">
            <h3>Library</h3>
            <button className="icon-button"><Icon path={<path d="M12 5v14m-7-7h14" />} /></button>
          </div>
          <ul>
            {libraryItems.map((item, index) => (
              <li key={index} className={item.active ? 'active' : ''}>
                <a href="#"><span>{item.text}</span></a>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-bottom">
            <a href="#"><Icon path={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} /> <span>Account</span></a>
            <a href="#"><Icon path={<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>} /> <span>Upgrade</span></a>
            <a href="#"><Icon path={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>} /> <span>Install</span></a>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
            <div className="header-right">
                 <button className="icon-button"><Icon path={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} /></button>
                 <button className="share-btn">Share</button>
            </div>
        </header>

        <section className="chat-area">
          <div className="chat-content-wrapper">
            <h1 className="chat-title">hello</h1>
            <div className="chat-response">
              <div className="response-header">
                <span className="response-type answer">Answer</span>
                <span className="response-type">Search</span>
              </div>
              <p>
                Hello Chetram! Good to see you here again. It's quite late - 11:05 PM on a Saturday night. Are you having one of those late-night coding sessions, or perhaps working on a new project?
              </p>
              <p>
                Given your interest in MERN stack development and browser automation, I'm curious what you're tinkering with tonight. Whether it's a frontend challenge, exploring new AI tools, or maybe planning your next workout routine - I'm here to help!
              </p>
              <p>
                What's on your mind today?
              </p>
            </div>
            <footer className="response-footer">
              <div className="footer-actions">
                  <button><Icon path={<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" /></>} /> Share</button>
                  <button><Icon path={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>} /> Export</button>
                  <button><Icon path={<><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><polyline points="21 3 21 8 16 8" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><polyline points="3 21 3 16 8 16" /></>} /> Rewrite</button>
              </div>
              <div className="footer-icons">
                  <button className="icon-button"><Icon path={<><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>} /></button>
                  <button className="icon-button"><Icon path={<><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>} /></button>
                  <button className="icon-button"><Icon path={<><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></>} /></button>
                  <button className="icon-button"><Icon path={<><path d="M10 15v-5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" /></>} /></button>
                  <button className="icon-button"><Icon path={<><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></>} /></button>
              </div>
            </footer>
          </div>
        </section>

        <section className="chat-input-area">
          <form className="input-form" onSubmit={(e) => e.preventDefault()}>
              <input type="text" defaultValue="hello" placeholder="Ask anything..."/>
              <div className="input-actions">
                <button type="button" className="icon-button file-btn">
                    <Icon path={<><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></>} />
                </button>
                <button type="button" className="icon-button mic-btn">
                    <Icon path={<><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>} />
                </button>
                <button type="submit" className="send-button">
                    <Icon path={<><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>} />
                </button>
              </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default ChatInterface;