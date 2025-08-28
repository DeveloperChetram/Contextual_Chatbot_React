import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  getChats,
  createChat,
  getMessages,
  sendMessage,
} from "../redux/actions/chatActions";
import {
  setActiveChatId,
  addMessage,
  setModelTyping,
} from "../redux/reducers/chatSlice";
import { logoutUser } from "../redux/actions/authActions";
import TypingIndicator from "./TypingIndicator";
import "../styles/theme.css";
import "../styles/ChatInterface.css";

// --- Helper Components ---
const Icon = ({ path, className = "" }) => (
    <svg
      className={`icon ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {path}
    </svg>
  );

  const LogoIcon = () => (
    <svg
      className="logo-icon-svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12.48 3.52a1 1 0 0 0-1 1v2.92a1 1 0 0 0 .52.88l5.44 3.14a1 1 0 0 0 1.5-.87V7.52a1 1 0 0 0-.52-.88l-5.44-3.14a1 1 0 0 0-.5 0zM5.08 7.52a1 1 0 0 0-.52.88v2.92a1 1 0 0 0 .52.88l5.44 3.14a1 1 0 0 0 1.5-.87V11.4a1 1 0 0 0-.52-.88L6.58 7.52a1 1 0 0 0-1.5 0zM12 14.5l-5.44 3.14a1 1 0 0 0-.52.88v2.92a1 1 0 0 0 1.5.87l5.44-3.14a1 1 0 0 0 .52-.88v-2.92a1 1 0 0 0-1.5-.87z" />
    </svg>
  );

// --- Main Chat Component ---
const ChatInterface = () => {
  const [isCreditsVisible, setIsCreditsVisible] = useState(false);
  const creditsTimeoutRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { chats, messages, activeChatId, loading, isModelTyping } = useSelector(
    (state) => state.chat
  );

  // --- Local State ---
  const [socket, setSocket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  // --- Refs ---
  
  const chatAreaRef = useRef(null);
  const textareaRef = useRef(null);

  // --- Constants ---
  const MAX_TITLE_WORDS = 35;
  const MAX_PROMPT_CHARS = 1400;

  // --- Effects ---
  useEffect(() => {
    // Cleanup timeout on component unmount
    return () => {
      if (creditsTimeoutRef.current) {
        clearTimeout(creditsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    dispatch(getChats());

    const newSocket = io("http://localhost:3000", { withCredentials: true });
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [dispatch]);

  useEffect(() => {
    if (socket) {
      socket.on("ai-response", ({ chatId, response }) => {
        dispatch(setModelTyping({ chatId, isTyping: false }));

        const modelMessage = {
          _id: `model-${Date.now()}`,
          chatId,
          content: response,
          role: "model",
        };
        dispatch(addMessage({ chatId, message: modelMessage }));
      });
    }
  }, [socket, dispatch]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, activeChatId, isModelTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // --- Event Handlers ---
// ... inside the component, near other handlers

const handleCreditsClick = () => {
  // If a timer is already running, clear it to reset
  if (creditsTimeoutRef.current) {
    clearTimeout(creditsTimeoutRef.current);
  }

  // Show the credits text
  setIsCreditsVisible(true);

  // Set a new timer to hide the credits after 5 seconds
  creditsTimeoutRef.current = setTimeout(() => {
    setIsCreditsVisible(false);
    creditsTimeoutRef.current = null; // Clear the ref after timeout
  }, 5000);
};
  const handleCreateNewChat = () => setIsCreatingNewChat(true);

  const handleNewChatSubmit = (e) => {
    e.preventDefault();
    if (!newChatTitle.trim() || titleError) return;
    dispatch(createChat(newChatTitle));
    setNewChatTitle("");
    setIsCreatingNewChat(false);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setNewChatTitle(value);
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
    setTitleError(
      wordCount > MAX_TITLE_WORDS
        ? `Title cannot exceed ${MAX_TITLE_WORDS} words.`
        : ""
    );
  };

  const handleHistoryClick = (id) => {
    console.log('Clicking on chat with ID:', id);
    console.log('Current messages:', messages);
    console.log('Current activeChatId:', activeChatId);
    
    dispatch(setActiveChatId(id));
    if (!messages[id]) {
      console.log('Messages not found for this chat, fetching...');
      dispatch(getMessages(id));
    } else {
      console.log('Messages already available for this chat');
    }
    
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
    if (
      !inputValue.trim() ||
      !activeChatId ||
      inputValue.length > MAX_PROMPT_CHARS
    )
      return;
    dispatch(sendMessage(socket, activeChatId, inputValue));
    setInputValue("");
  };

  const logoutHandler = async () => {
    const result = await dispatch(logoutUser());
    if (result.success) {
      navigate('/login');
    }
  };

  const activeChat = chats.find((chat) => chat._id === activeChatId);

  return (
    <div className="chat-container">
       <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <LogoIcon />
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
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
          <div className="library-header">
            <h3>History</h3>
          </div>
          {isCreatingNewChat && (
            <div className="new-chat-form-container">
              <form
                onSubmit={handleNewChatSubmit}
                className={`new-chat-form ${titleError ? "error" : ""}`}
              >
                <input
                  type="text"
                  placeholder="New chat title..."
                  value={newChatTitle}
                  onChange={handleTitleChange}
                  onBlur={() => !newChatTitle && setIsCreatingNewChat(false)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="submit-new-chat-btn"
                  disabled={!!titleError}
                >
                  <Icon
                    path={
                      titleError ? (
                        <path d="M18 6L6 18M6 6l12 12" />
                      ) : (
                        <path d="M20 6L9 17l-5-5" />
                      )
                    }
                  />
                </button>
              </form>
              {titleError && (
                <p className="title-error-warning">{titleError}</p>
              )}
            </div>
          )}
          <ul>
            {chats.length > 0 ? (
              chats.map((item) => (
                <li
                  key={item._id}
                  className={item._id === activeChatId ? "active" : ""}
                >
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleHistoryClick(item._id);
                    }}
                  >
                    <span>{item.title}</span>
                  </a>
                </li>
              ))
            ) : (
              <li>
                <a href="#" className="no-chats">
                  <span>No chats found</span>
                </a>
              </li>
            )}
          </ul>
        </div>
        <div className="sidebar-bottom">
          <div className="user-profile">
            <div className="user-info">
              <Icon
                path={
                  <>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </>
                }
              />
              <span>{user?.fullName?.firstName || "Username"}</span>
            </div>
            <div 
  className={`credits-container ${isCreditsVisible ? 'show-text' : ''}`}
  onClick={handleCreditsClick}
>
              <span>Credits: 50</span>
            </div>
          </div>
        </div>
      </aside>
      <main className="main-content">
      <header className="main-header">
          <div className="header-left">
            <button
              className="header-hamburger"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <Icon
                path={
                  <>
                    <path d="M3 12h18" />
                    <path d="M3 6h18" />
                    <path d="M3 18h18" />
                  </>
                }
              />
            </button>
            <div className="header-title-wrapper">
              <h2>{activeChat?.title || "Welcome"}</h2>
            </div>
          </div>
          <div className="header-right">
            <button className="share-btn logout" onClick={logoutHandler}>
              Log out
            </button>
          </div>
        </header>
        <section className="chat-area" ref={chatAreaRef}>
          <div className="chat-content-wrapper">
            {/* Debug info - remove this after fixing */}
            <div style={{color: 'red', fontSize: '12px', marginBottom: '10px'}}>
              Debug: activeChatId: {activeChatId}, messages count: {activeChatId ? (messages[activeChatId]?.length || 0) : 0}
            </div>
            {loading && <div className="empty-chat-placeholder"><h2>Loading...</h2></div>}

            {!loading && activeChatId && messages[activeChatId]?.length > 0 && messages[activeChatId].map((msg) => (
              <div key={msg._id} className={`chat-turn ${msg.role}`}>
                <div className="message-header">
                  <h3 className="message-sender">{msg.role === "user" ? "You" : "Model"}</h3>
                  <button className="copy-btn" onClick={() => handleCopyMessage(msg.content, msg._id)}>
                    <Icon path={copiedMessageId === msg._id ? <path d="M20 6L9 17l-5-5" /> : <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>} />
                  </button>
                </div>
                <div className="message-text">
                  {msg.role === "model" ? (
                    <ReactMarkdown
                      children={msg.content}
                      components={{
                        code(props) {
                          const {children, className, node, ...rest} = props
                          const match = /language-(\w+)/.exec(className || '')
                          return match ? (
                            <SyntaxHighlighter
                              {...rest}
                              children={String(children).replace(/\n$/, '')}
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                            />
                          ) : (
                            <code {...rest} className={className}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {isModelTyping[activeChatId] && <TypingIndicator />}

            {!loading && (!messages[activeChatId] || messages[activeChatId].length === 0) && !isModelTyping[activeChatId] && (
                 <div className="empty-chat-placeholder">
                 <h2>
                   {activeChatId
                     ? "Start a new conversation"
                     : "Select or create a chat to begin"}
                 </h2>
                 <p>
                   {activeChatId
                     ? "Type your first message below."
                     : "Choose a chat from the sidebar or create a new one."}
                 </p>
               </div>
            )}
          </div>
        </section>

        <section className="chat-input-area">
        <form className="input-form" onSubmit={handleSendMessage}>
            <div className="input-wrapper">
              <textarea
                ref={textareaRef}
                rows="1"
                placeholder="Ask anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            <div className="input-footer">
              <div className="input-footer-left">
                <select name="model" className="model-selector">
                  <option value="jhanvi">Jhanvi</option>
                  <option value="chandni">Chandni</option>
                </select>
                <div
                  className={`char-counter ${
                    inputValue.length > MAX_PROMPT_CHARS ? "error" : ""
                  }`}
                >
                  {MAX_PROMPT_CHARS - inputValue.length} / 1400
                </div>
              </div>
              <div className="input-footer-right">
                <button
                  type="submit"
                  className="send-button"
                  disabled={
                    !inputValue.trim() ||
                    inputValue.length > MAX_PROMPT_CHARS ||
                    !activeChatId
                  }
                >
                  <Icon
                    path={
                      <>
                        <line x1="12" y1="19" x2="12" y2="5" />
                        <polyline points="5 12 12 5 19 12" />
                      </>
                    }
                  />
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