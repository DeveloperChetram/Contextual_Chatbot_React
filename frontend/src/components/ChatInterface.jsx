// frontend/src/components/ChatInterface.jsx

import React, { useState, useEffect, useRef } from 'react';
import '../styles/theme.css'; // Import theme styles
import '../styles/ChatInterface.css'; // Import component styles

// Icon component remains the same...
const Icon = ({ path, className = '' }) => (
  <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

// Logo component remains the same...
const LogoIcon = () => (
    <svg className="logo-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.48 3.52a1 1 0 0 0-1 1v2.92a1 1 0 0 0 .52.88l5.44 3.14a1 1 0 0 0 1.5-.87V7.52a1 1 0 0 0-.52-.88l-5.44-3.14a1 1 0 0 0-.5 0zM5.08 7.52a1 1 0 0 0-.52.88v2.92a1 1 0 0 0 .52.88l5.44 3.14a1 1 0 0 0 1.5-.87V11.4a1 1 0 0 0-.52-.88L6.58 7.52a1 1 0 0 0-1.5 0zM12 14.5l-5.44 3.14a1 1 0 0 0-.52.88v2.92a1 1 0 0 0 1.5.87l5.44-3.14a1 1 0 0 0 .52-.88v-2.92a1 1 0 0 0-1.5-.87z"/>
    </svg>
);

const initialChatData = {
  '1': {
    title: 'hello',
    messages: [
      { id: 'user1', from: 'user', text: 'hello' },
      { id: 'model1', from: 'model', text: "Hello Chetram! Good to see you here again. It's quite late - 11:05 PM on a Saturday night. Are you having one of those late-night coding sessions, or perhaps working on a new project?" },
    ]
  },
  '2': {
    title: '/* theme.css */ /* Impor',
    messages: [
      { id: 'user2', from: 'user', text: '/* theme.css */ /* Impor' },
      { id: 'model2', from: 'model', text: "This seems to be a CSS comment. Are you working on styling a web page?" },
    ]
  },
   '3': {
    title: 'Search all major job boa',
    messages: [
       { id: 'user3', from: 'user', text: 'Search all major job boa' },
       { id: 'model3', from: 'model', text: "I can help with that. Which job boards are you interested in?" },
    ]
  }
};

// --- Updated Typing Effect Component ---
const TypingEffect = ({ text, onComplete, scrollToBottom }) => {
    const [displayedText, setDisplayedText] = useState('');
    
    useEffect(() => {
        setDisplayedText(''); // Reset on new text
        let index = 0;
        const intervalId = setInterval(() => {
            setDisplayedText(prev => prev + text.charAt(index));
            index++;
            
            if (scrollToBottom) scrollToBottom();

            if (index >= text.length) {
                clearInterval(intervalId);
                if (onComplete) onComplete();
            }
        }, 15);

        return () => clearInterval(intervalId);
    }, [text, onComplete, scrollToBottom]);

    return <p className="message-text">{displayedText}</p>;
};


const ChatInterface = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [activeChatId, setActiveChatId] = useState('1');
  const [chats, setChats] = useState(initialChatData);
  const [historyItems, setHistoryItems] = useState(
      Object.entries(initialChatData).map(([id, data]) => ({ id, text: data.title }))
  );
  const [inputValue, setInputValue] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [isModelTyping, setIsModelTyping] = useState(false);
  const chatAreaRef = useRef(null);
  const sidebarRef = useRef(null);
  
  const activeChat = chats[activeChatId];
  const MAX_TITLE_WORDS = 35;

  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  const handleCreateNewChat = () => {
    setIsCreatingNewChat(true);
  };

  const handleNewChatSubmit = (e) => {
    e.preventDefault();
    if (newChatTitle.trim() && !titleError) {
      const newChatId = Date.now().toString();
      const newChat = { id: newChatId, text: newChatTitle };
      setHistoryItems(prev => [newChat, ...prev]);
      setChats(prev => ({ ...prev, [newChatId]: { title: newChatTitle, messages: [] } }));
      setActiveChatId(newChatId);
      setNewChatTitle("");
      setIsCreatingNewChat(false);
    }
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setNewChatTitle(value);
    
    // Word count logic
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

    if (wordCount > MAX_TITLE_WORDS) {
      setTitleError(`Title cannot exceed ${MAX_TITLE_WORDS} words.`);
    } else {
      setTitleError("");
    }
  };
  
  const handleHistoryClick = (id) => {
    setActiveChatId(id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleCopyMessage = (text, messageId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeChatId || isModelTyping) return;
    const userMessage = { id: `user-${Date.now()}`, from: 'user', text: inputValue };
    setChats(prev => {
        const updatedChats = { ...prev };
        updatedChats[activeChatId].messages.push(userMessage);
        return updatedChats;
    });
    setInputValue("");
    setTimeout(scrollToBottom, 0);
    setIsModelTyping(true);
    setTimeout(() => {
      const aiResponse = { id: `model-${Date.now()}`, from: 'model', text: `This is a simulated response to "${inputValue}". It is revealing character by character.` };
      setChats(prev => ({ ...prev, [activeChatId]: { ...prev[activeChatId], messages: [...prev[activeChatId].messages, aiResponse] } }));
    }, 1000);
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isModelTyping]);

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            if(window.innerWidth < 768) setSidebarOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 768) setSidebarOpen(true);
    else setSidebarOpen(false);
  }, []);

  return (
    <div className="chat-container">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
        <div className="sidebar-header">
            <div className="logo-container"> <LogoIcon /> </div>
            <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
                <Icon path={<path d="M18 6L6 18M6 6l12 12" />} />
            </button>
        </div>
         <div className="sidebar-top">
          <nav className="main-nav">
             <button className="new-thread-btn" onClick={handleCreateNewChat}>
                <Icon path={<path d="M12 5v14m-7-7h14" />} />
                <span>New Chat</span>
            </button>
          </nav>
        </div>
        <div className="library">
          <div className="library-header"> <h3>History</h3> </div>
          {isCreatingNewChat && (
            <div className="new-chat-form-container">
              <form onSubmit={handleNewChatSubmit} className={`new-chat-form ${titleError ? 'error' : ''}`}>
                <input 
                  type="text"
                  placeholder="New chat title..."
                  value={newChatTitle}
                  onChange={handleTitleChange}
                  onBlur={() => !newChatTitle && setIsCreatingNewChat(false)}
                  autoFocus
                />
                <button type="submit" className="submit-new-chat-btn" disabled={!!titleError}>
                  <Icon path={titleError ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M20 6L9 17l-5-5" />} />
                </button>
              </form>
              {titleError && <p className="title-error-warning">{titleError}</p>}
            </div>
          )}
          <ul>
            {historyItems.map((item) => (
              <li key={item.id} className={item.id === activeChatId ? 'active' : ''}>
                <a href="#" onClick={(e) => { e.preventDefault(); handleHistoryClick(item.id); }}>
                    <span>{item.text}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="sidebar-bottom">
            <div className="user-profile">
                <div className="user-info">
                    <Icon path={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} /> 
                    <span>Chetram</span>
                </div>
                <div className="credits-container">
                    <span>Credits: 50</span>
                </div>
            </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
            <div className="header-left">
                <button className="header-hamburger" onClick={() => setSidebarOpen(prev => !prev)}>
                    <Icon path={<><path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" /></>} />
                </button>
                <div className="header-title-wrapper">
                    <h2>{activeChat?.title || "New Chat"}</h2>
                </div>
            </div>
            <div className="header-right">
                 <button className="share-btn">Log out</button>
            </div>
        </header>

        <section className="chat-area" ref={chatAreaRef}>
          <div className="chat-content-wrapper">
            {activeChat?.messages.length > 0 ? (
              activeChat.messages.map((msg, index) => {
                const isLastMessage = index === activeChat.messages.length - 1;
                return (
                  <div key={msg.id} className={`chat-turn ${msg.from}`}>
                    <div className="message-header">
                      <h3 className="message-sender">{msg.from === 'user' ? 'You' : 'Model'}</h3>
                      <button className="copy-btn" onClick={() => handleCopyMessage(msg.text, msg.id)}>
                          <Icon path={copiedMessageId === msg.id ? <path d="M20 6L9 17l-5-5"/> : <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>} />
                      </button>
                    </div>
                    {msg.from === 'model' && isLastMessage && isModelTyping ? (
                      <TypingEffect text={msg.text} onComplete={() => setIsModelTyping(false)} scrollToBottom={scrollToBottom} />
                    ) : (
                      <p className="message-text">{msg.text}</p>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="empty-chat-placeholder">
                <h2>Start a new conversation</h2>
                <p>Type your first message below.</p>
              </div>
            )}
            {isModelTyping && activeChat?.messages[activeChat.messages.length - 1]?.from === 'user' && (
                <div className="chat-turn model">
                    <div className="message-header"> <h3 className="message-sender">Model</h3> </div>
                    <div className="typing-indicator">
                       <span className="typing-text">Typing</span>
                       <div className="dots-container">
                          <span></span><span></span><span></span>
                       </div>
                    </div>
                </div>
            )}
          </div>
        </section>

        <section className="chat-input-area">
            <form className="input-form" onSubmit={handleSendMessage}>
            <div className="input-wrapper">
              <input type="text" placeholder="Ask anything..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
              <div className="input-right-actions">
                 <select name="model" className="model-selector">
                    <option value="jhanvi">Jhanvi</option>
                    <option value="chandni">Chandni</option>
                 </select>
                <button type="submit" className="send-button" disabled={!inputValue.trim() || isModelTyping}>
                  <Icon path={<><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>} />
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default ChatInterface;