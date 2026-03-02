import React, { memo } from 'react';

const Icon = memo(({ path, className = '' }) => (
    <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {path}
    </svg>
));

// Module-level constant — no useMemo needed
const MAX_TITLE_WORDS = 35;

const ChatHistoryItem = memo(({
    item,
    activeChatId,
    editingChatId,
    editingTitle,
    savingChatId,
    onSelect,
    onEditStart,
    onEditCancel,
    onEditSave,
    onEditTitleChange,
}) => {
    const isEditing = editingChatId === item._id;
    const isActive = item._id === activeChatId;

    if (isEditing) {
        return (
            <li key={item._id} className={isActive ? 'active' : ''}>
                <div className="edit-chat-container">
                    <form onSubmit={onEditSave} className="edit-chat-form">
                        <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => onEditTitleChange(e.target.value)}
                            onBlur={onEditCancel}
                            autoFocus
                            className="edit-chat-input"
                            placeholder="New chat title..."
                        />
                        <button
                            type="submit"
                            className="save-edit-btn"
                            disabled={savingChatId === item._id || !editingTitle.trim()}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            {savingChatId === item._id
                                ? <div className="saving-spinner" />
                                : <Icon path={<path d="M20 6L9 17l-5-5" />} />
                            }
                        </button>
                    </form>
                </div>
            </li>
        );
    }

    return (
        <li key={item._id} className={isActive ? 'active' : ''}>
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); onSelect(item._id); }}
            >
                <span>{item.title}</span>
                {isActive && (
                    <button
                        className="edit-chat-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onEditStart(item._id, item.title);
                        }}
                    >
                        <Icon path={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>} />
                    </button>
                )}
            </a>
        </li>
    );
});

ChatHistoryItem.displayName = 'ChatHistoryItem';

const ChatHistory = memo(({
    chats,
    isAuthenticated,
    activeChatId,
    editingChatId,
    editingTitle,
    savingChatId,
    onSelect,
    onEditStart,
    onEditCancel,
    onEditSave,
    onEditTitleChange,
}) => (
    <ul>
        {isAuthenticated ? (
            chats.length > 0 ? (
                chats.map((item) => (
                    <ChatHistoryItem
                        key={item._id}
                        item={item}
                        activeChatId={activeChatId}
                        editingChatId={editingChatId}
                        editingTitle={editingTitle}
                        savingChatId={savingChatId}
                        onSelect={onSelect}
                        onEditStart={onEditStart}
                        onEditCancel={onEditCancel}
                        onEditSave={onEditSave}
                        onEditTitleChange={onEditTitleChange}
                    />
                ))
            ) : (
                <li><a href="#" className="no-chats"><span>No chats found</span></a></li>
            )
        ) : (
            <li><a href="#" className="no-chats"><span>Login to see history</span></a></li>
        )}
    </ul>
));

ChatHistory.displayName = 'ChatHistory';
export default ChatHistory;
