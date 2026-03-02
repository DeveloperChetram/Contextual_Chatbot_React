import React, { memo, useRef, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CharacterInfoCard from './CharacterInfoCard';

// Module-level constants — no useMemo needed for primitives (PERF-04 fix)
const MAX_PROMPT_CHARS = 1400;

const Icon = memo(({ path, className = '' }) => (
    <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {path}
    </svg>
));

const ChatInputForm = memo(({
    inputValue,
    setInputValue,
    activeChatId,
    isAuthenticated,
    character,
    characterLoading,
    lastPrompt,
    onSendMessage,
    onChangeCharacter,
}) => {
    const textareaRef = useRef(null);
    const [isRetryActive, setIsRetryActive] = useState(false);
    const [showCharacterInfo, setShowCharacterInfo] = useState(false);
    // Read custom characters from Redux for the selector
    const customCharacters = useSelector(s => s.customCharacters.items);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputValue]);

    // MINOR-05 fix: functional toggle — stable ref, no stale closure
    const handleCharacterInfoClick = useCallback(() => {
        setShowCharacterInfo(prev => !prev);
    }, []);

    const handleClickOutsideInfo = useCallback((event) => {
        if (!event.target.closest('.character-info-container')) {
            setShowCharacterInfo(false);
        }
    }, []);

    useEffect(() => {
        if (showCharacterInfo) {
            document.addEventListener('mousedown', handleClickOutsideInfo);
            return () => document.removeEventListener('mousedown', handleClickOutsideInfo);
        }
    }, [showCharacterInfo, handleClickOutsideInfo]);

    const handleRetryClick = useCallback(() => {
        if (lastPrompt) {
            setIsRetryActive(true);
            setInputValue(lastPrompt);
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.setSelectionRange(lastPrompt.length, lastPrompt.length);
                }
                setTimeout(() => setIsRetryActive(false), 300);
            }, 0);
        }
    }, [lastPrompt, setInputValue]);

    const placeholder = !isAuthenticated
        ? 'Login to chat'
        : characterLoading
            ? 'Changing character...'
            : !activeChatId
                ? 'Create a chat first, then send a message'
                : 'Ask anything...';

    return (
        <section className="chat-input-area">
            <form className="input-form" onSubmit={onSendMessage}>
                <div className="input-wrapper">
                    <textarea
                        ref={textareaRef}
                        rows="1"
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSendMessage(e);
                            }
                        }}
                        disabled={characterLoading || !isAuthenticated || !activeChatId}
                    />
                </div>
                <div className="input-footer">
                    <div className="input-footer-left">
                        <select
                            name="model"
                            value={character}
                            className={`model-selector ${characterLoading ? 'loading' : ''}`}
                            onChange={onChangeCharacter}
                            disabled={characterLoading || !isAuthenticated || !activeChatId}
                        >
                            <optgroup label="Built-in">
                                <option value="atomic">Atomic</option>
                                <option value="chandni">Chandni</option>
                                <option value="bhaiya">Harsh Bhaiya</option>
                                <option value="osho">Osho</option>
                            </optgroup>
                            {(customCharacters || []).length > 0 && (
                                <optgroup label="My Characters">
                                    {(customCharacters || []).map(c => (
                                        <option key={c._id} value={`custom:${c._id}`}>
                                            {c.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>

                        <div className="character-info-container">
                            <button
                                type="button"
                                className={`character-info-btn ${showCharacterInfo ? 'active' : ''}`}
                                onClick={handleCharacterInfoClick}
                                disabled={!isAuthenticated}
                            >
                                <div className="diamond-icon">
                                    <div className="diamond-inner" />
                                </div>
                            </button>
                            {showCharacterInfo && <CharacterInfoCard />}
                        </div>

                        <button
                            type="button"
                            className={`retry-btn ${isRetryActive ? 'active' : ''}`}
                            onClick={handleRetryClick}
                            disabled={!isAuthenticated || !lastPrompt}
                            title="Re-enter last prompt"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                <path d="M21 3v5h-5" />
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                <path d="M3 21v-5h5" />
                            </svg>
                        </button>

                        <div className={`char-counter ${inputValue.length > MAX_PROMPT_CHARS ? 'error' : ''}`}>
                            {MAX_PROMPT_CHARS - inputValue.length} / {MAX_PROMPT_CHARS}
                        </div>
                    </div>

                    <div className="input-footer-right">
                        <button
                            type="submit"
                            className="send-button"
                            disabled={!inputValue.trim() || inputValue.length > MAX_PROMPT_CHARS || !activeChatId || characterLoading || !isAuthenticated}
                        >
                            <Icon path={<><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>} />
                        </button>
                    </div>
                </div>
            </form>
        </section>
    );
});

ChatInputForm.displayName = 'ChatInputForm';
export default ChatInputForm;
