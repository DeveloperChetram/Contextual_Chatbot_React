import React, { memo, useCallback, useState } from 'react';
import ChatHistory from './ChatHistory';
import { axiosInstance } from '../../api/axios.jsx';
import { useDispatch } from 'react-redux';
import { updateChat, setActiveChatId } from '../../redux/reducers/chatSlice';

// Module-level constant
const MAX_TITLE_WORDS = 35;

const LogoIcon = memo(() => (
    <svg className="logo-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.48 3.52a1 1 0 0 0-1 1v2.92a1 1 0 0 0 .52.88l5.44 3.14a1 1 0 0 0 1.5-.87V7.52a1 1 0 0 0-.52-.88l-5.44-3.14a1 1 0 0 0-.5 0zM5.08 7.52a1 1 0 0 0-.52.88v2.92a1 1 0 0 0 .52.88l5.44 3.14a1 1 0 0 0 1.5-.87V11.4a1 1 0 0 0-.52-.88L6.58 7.52a1 1 0 0 0-1.5 0zM12 14.5l-5.44 3.14a1 1 0 0 0-.52.88v2.92a1 1 0 0 0 1.5.87l5.44-3.14a1 1 0 0 0 .52-.88v-2.92a1 1 0 0 0-1.5-.87z" />
    </svg>
));

const Icon = memo(({ path, className = '' }) => (
    <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {path}
    </svg>
));

const Sidebar = memo(({
    sidebarOpen,
    isAuthenticated,
    user,
    chats,
    activeChatId,
    creatingChat,
    credits,
    creditsLoading,
    isCreditsVisible,
    onClose,
    onNewChat,
    onSelectChat,
    onCreditsClick,
}) => {
    const dispatch = useDispatch();

    const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
    const [newChatTitle, setNewChatTitle] = useState('');
    const [titleError, setTitleError] = useState('');

    const [editingChatId, setEditingChatId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [savingChatId, setSavingChatId] = useState(null);

    const handleTitleChange = useCallback((value) => {
        setNewChatTitle(value);
        const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
        setTitleError(wordCount > MAX_TITLE_WORDS ? `Title cannot exceed ${MAX_TITLE_WORDS} words.` : '');
    }, []);

    // MINOR-03: Combined form submit (was two identical handlers — handleNewChatSubmit & handleFirstChatSubmit)
    const handleNewChatFormSubmit = useCallback((e) => {
        e.preventDefault();
        if (!newChatTitle.trim() || titleError) return;
        onNewChat(newChatTitle.trim());
        setNewChatTitle('');
        setTitleError('');
        setIsCreatingNewChat(false);
    }, [newChatTitle, titleError, onNewChat]);

    const handleCreateNewChat = useCallback(() => setIsCreatingNewChat(true), []);

    const handleSelectChat = useCallback((id) => {
        onSelectChat(id);
    }, [onSelectChat]);

    const handleEditStart = useCallback((chatId, currentTitle) => {
        setEditingChatId(chatId);
        setEditingTitle(currentTitle);
    }, []);

    const handleEditCancel = useCallback(() => {
        setEditingChatId(null);
        setEditingTitle('');
    }, []);

    const handleEditTitleChange = useCallback((value) => {
        setEditingTitle(value);
    }, []);

    const handleEditSave = useCallback(async (e) => {
        e.preventDefault();
        if (!editingTitle.trim() || editingTitle.trim().split(/\s+/).filter(Boolean).length > MAX_TITLE_WORDS) {
            handleEditCancel();
            return;
        }
        setSavingChatId(editingChatId);
        try {
            await axiosInstance.put(`/chat/${editingChatId}`, { title: editingTitle.trim() });
            dispatch(updateChat({ chatId: editingChatId, updates: { title: editingTitle.trim() } }));
            dispatch(setActiveChatId(editingChatId));
        } catch (error) {
            console.error('Error updating chat title:', error.message);
        } finally {
            setEditingChatId(null);
            setEditingTitle('');
            setSavingChatId(null);
        }
    }, [editingTitle, editingChatId, handleEditCancel, dispatch]);

    return (
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-container">
                    <LogoIcon />
                    <span className="logo-text">Atomic</span>
                </div>
                <button className="sidebar-close-btn" onClick={(e) => { e.stopPropagation(); onClose(); }}>
                    <Icon path={<><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></>} className="sidebar-close-icon" />
                </button>
            </div>

            <div className="sidebar-top">
                <nav className="main-nav">
                    <button
                        className="new-thread-btn"
                        onClick={handleCreateNewChat}
                        disabled={!isAuthenticated || creatingChat}
                    >
                        <Icon path={<path d="M12 5v14m-7-7h14" />} />
                        <span>{creatingChat ? 'Creating...' : 'New Chat'}</span>
                    </button>
                </nav>
            </div>

            <div className="library">
                <div className="library-header"><h3>History</h3></div>

                {isCreatingNewChat && (
                    <div className="new-chat-form-container">
                        <form onSubmit={handleNewChatFormSubmit} className={`new-chat-form ${titleError ? 'error' : ''}`}>
                            <input
                                type="text"
                                placeholder="New chat title..."
                                value={newChatTitle}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                onBlur={() => !newChatTitle && setIsCreatingNewChat(false)}
                                autoFocus
                            />
                            <button type="submit" className="submit-new-chat-btn" disabled={!!titleError || creatingChat}>
                                <Icon path={titleError
                                    ? <path d="M18 6L6 18M6 6l12 12" />
                                    : creatingChat
                                        ? <path d="M12 2v4m0 4v4" />
                                        : <path d="M20 6L9 17l-5-5" />
                                } />
                            </button>
                        </form>
                        {titleError && <p className="title-error-warning">{titleError}</p>}
                    </div>
                )}

                <ChatHistory
                    chats={chats}
                    isAuthenticated={isAuthenticated}
                    activeChatId={activeChatId}
                    editingChatId={editingChatId}
                    editingTitle={editingTitle}
                    savingChatId={savingChatId}
                    onSelect={handleSelectChat}
                    onEditStart={handleEditStart}
                    onEditCancel={handleEditCancel}
                    onEditSave={handleEditSave}
                    onEditTitleChange={handleEditTitleChange}
                />
            </div>

            <div className="sidebar-bottom">
                <div className="user-profile">
                    <div className="user-info">
                        <Icon path={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />
                        <span>{user?.fullName?.firstName || 'Guest User'}</span>
                    </div>
                    <div
                        className={`credits-container ${isCreditsVisible ? 'show-text' : ''} ${creditsLoading ? 'loading' : ''} ${credits === 0 ? 'zero-credits' : ''}`}
                        onClick={onCreditsClick}
                    >
                        <span>
                            {creditsLoading
                                ? <div className="loading-spinner" />
                                : isAuthenticated
                                    ? `Credits: ${credits}`
                                    : isCreditsVisible ? 'Login First' : 'Credits: 0'
                            }
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;
