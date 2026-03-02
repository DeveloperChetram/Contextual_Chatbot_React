import React, { useState, useEffect, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../api/axios.jsx';
import { loginSuccess, logout } from '../redux/reducers/authSlice';
import { clearChatStore } from '../redux/reducers/chatSlice';
import {
    setCustomCharacters, addCustomCharacter, updateCustomCharacter, removeCustomCharacter,
} from '../redux/reducers/customCharacterSlice';
import { setMemories, setMemoryLoading, removeMemory, clearMemories } from '../redux/reducers/memorySlice';
import '../styles/ProfilePage.css';

// ─── Sub-components ──────────────────────────────────────────────────────────

const Toast = memo(({ message, type }) => (
    message ? <div className={`pp-toast pp-toast-${type}`}>{message}</div> : null
));

const AvatarCircle = memo(({ firstName, lastName, color }) => {
    const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
    return (
        <div className="pp-avatar" style={{ backgroundColor: color || '#06b6d4' }}>
            {initials || '?'}
        </div>
    );
});

// ─── Tab 1: Profile ───────────────────────────────────────────────────────────

const ProfileTab = memo(({ user }) => {
    const dispatch = useDispatch();
    const [firstName, setFirstName] = useState(user?.fullName?.firstName || '');
    const [lastName, setLastName] = useState(user?.fullName?.lastName || '');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        axiosInstance.get('/auth/stats').then(r => setStats(r.data)).catch(() => { });
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim()) return showToast('Name cannot be empty', 'error');
        setSaving(true);
        try {
            const res = await axiosInstance.put('/auth/profile', { firstName: firstName.trim(), lastName: lastName.trim() });
            dispatch(loginSuccess(res.data.user));
            localStorage.setItem('user', JSON.stringify(res.data.user));
            showToast('Profile updated!');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="pp-tab-content">
            <Toast {...(toast || { message: null, type: 'success' })} />

            <div className="pp-profile-hero">
                <AvatarCircle firstName={firstName} lastName={lastName} color="#06b6d4" />
                <div className="pp-profile-email">{user?.email}</div>
            </div>

            {stats && (
                <div className="pp-stats-row">
                    <div className="pp-stat-card">
                        <span className="pp-stat-val">{stats.totalChats}</span>
                        <span className="pp-stat-label">Chats</span>
                    </div>
                    <div className="pp-stat-card">
                        <span className="pp-stat-val">{stats.totalMessages}</span>
                        <span className="pp-stat-label">Messages</span>
                    </div>
                    <div className="pp-stat-card">
                        <span className="pp-stat-val">{stats.credits}</span>
                        <span className="pp-stat-label">Credits Left</span>
                    </div>
                </div>
            )}

            <form className="pp-form" onSubmit={handleSave}>
                <div className="pp-form-row">
                    <div className="pp-field">
                        <label>First Name</label>
                        <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" />
                    </div>
                    <div className="pp-field">
                        <label>Last Name</label>
                        <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" />
                    </div>
                </div>
                <button type="submit" className="pp-btn pp-btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
});

// ─── Character Form (shared by create & edit) ─────────────────────────────────

const COLORS = ['#06b6d4', '#14b8a6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#ef4444', '#eab308'];

const CharacterForm = memo(({ initial, onSave, onCancel, saving }) => {
    const [name, setName] = useState(initial?.name || '');
    const [description, setDescription] = useState(initial?.description || '');
    const [systemPrompt, setSystemPrompt] = useState(initial?.systemPrompt || '');
    const [avatarColor, setAvatarColor] = useState(initial?.avatarColor || '#06b6d4');

    const handleSubmit = e => {
        e.preventDefault();
        onSave({ name, description, systemPrompt, avatarColor });
    };

    return (
        <form className="pp-char-form" onSubmit={handleSubmit}>
            <div className="pp-field">
                <label>Character Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. ScienceBot" maxLength={50} required />
            </div>
            <div className="pp-field">
                <label>Short Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this character do?" maxLength={200} />
            </div>
            <div className="pp-field">
                <label>System Prompt * <span className="pp-char-count">{systemPrompt.length}/2000</span></label>
                <textarea
                    value={systemPrompt}
                    onChange={e => setSystemPrompt(e.target.value)}
                    placeholder="You are a helpful assistant that specializes in…"
                    rows={6}
                    maxLength={2000}
                    required
                />
            </div>
            <div className="pp-field">
                <label>Avatar Color</label>
                <div className="pp-color-picker">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            type="button"
                            className={`pp-color-swatch ${avatarColor === c ? 'active' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setAvatarColor(c)}
                            aria-label={`Color ${c}`}
                        />
                    ))}
                </div>
            </div>
            <div className="pp-form-actions">
                <button type="button" className="pp-btn pp-btn-ghost" onClick={onCancel}>Cancel</button>
                <button type="submit" className="pp-btn pp-btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save Character'}
                </button>
            </div>
        </form>
    );
});

// ─── Tab 2: Characters ────────────────────────────────────────────────────────

const CharactersTab = memo(() => {
    const dispatch = useDispatch();
    const { items: characters, loading } = useSelector(s => s.customCharacters);
    const [mode, setMode] = useState('list'); // 'list' | 'create' | 'edit'
    const [editTarget, setEditTarget] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        axiosInstance.get('/characters')
            .then(r => dispatch(setCustomCharacters(r.data.characters)))
            .catch(() => { });
    }, [dispatch]);

    const handleCreate = useCallback(async (data) => {
        setSaving(true);
        try {
            const res = await axiosInstance.post('/characters', data);
            dispatch(addCustomCharacter(res.data.character));
            setMode('list');
            showToast('Character created!');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to create', 'error');
        } finally { setSaving(false); }
    }, [dispatch]);

    const handleEdit = useCallback(async (data) => {
        if (!editTarget || (!editTarget._id && !editTarget.id)) return showToast('Error: Character ID missing', 'error');
        const targetId = editTarget._id || editTarget.id;
        setSaving(true);
        try {
            const res = await axiosInstance.put(`/characters/${targetId}`, data);
            dispatch(updateCustomCharacter({ id: targetId, updates: res.data.character }));
            setMode('list');
            setEditTarget(null);
            showToast('Character updated!');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update', 'error');
        } finally { setSaving(false); }
    }, [dispatch, editTarget]);

    const handleDelete = useCallback(async (id) => {
        if (!id) return showToast('Error: Invalid ID', 'error');
        if (!window.confirm('Delete this character?')) return;
        setDeletingId(id);
        try {
            await axiosInstance.delete(`/characters/${id}`);
            dispatch(removeCustomCharacter(id));
            showToast('Character deleted');
        } catch {
            showToast('Failed to delete', 'error');
        } finally { setDeletingId(null); }
    }, [dispatch]);

    const BUILT_IN = [
        { name: 'Atomic', description: 'Accurate, concise, and truthful answers', color: '#06b6d4', locked: true },
        { name: 'Chandni', description: 'Calm, reserved, and to-the-point', color: '#14b8a6', locked: true },
        { name: 'Harsh Bhaiya', description: 'Motivational coding mentor', color: '#10b981', locked: true },
        { name: 'Osho', description: 'Indian mystic and spiritual master', color: '#f97316', locked: true },
    ];

    if (mode === 'create') return (
        <div className="pp-tab-content">
            <div className="pp-section-header">
                <button className="pp-back-btn" onClick={() => setMode('list')}>← Back</button>
                <h3>New Character</h3>
            </div>
            <CharacterForm onSave={handleCreate} onCancel={() => setMode('list')} saving={saving} />
        </div>
    );

    if (mode === 'edit') return (
        <div className="pp-tab-content">
            <div className="pp-section-header">
                <button className="pp-back-btn" onClick={() => { setMode('list'); setEditTarget(null); }}>← Back</button>
                <h3>Edit: {editTarget?.name}</h3>
            </div>
            <CharacterForm initial={editTarget} onSave={handleEdit} onCancel={() => { setMode('list'); setEditTarget(null); }} saving={saving} />
        </div>
    );

    return (
        <div className="pp-tab-content">
            <Toast {...(toast || { message: null, type: 'success' })} />
            <div className="pp-section-header">
                <div>
                    <h3>Your Custom Characters</h3>
                    <p className="pp-section-sub">Create AI personalities with your own system prompts</p>
                </div>
                <button className="pp-btn pp-btn-primary" onClick={() => setMode('create')}>+ New Character</button>
            </div>

            <div className="pp-char-grid">
                {/* Built-in locked cards */}
                {BUILT_IN.map(c => (
                    <div key={c.name} className="pp-char-card locked">
                        <div className="pp-char-avatar" style={{ backgroundColor: c.color }}>{c.name[0]}</div>
                        <div className="pp-char-info">
                            <h4>{c.name} <span className="pp-locked-badge">Built-in</span></h4>
                            <p>{c.description}</p>
                        </div>
                    </div>
                ))}

                {/* Custom characters */}
                {(characters || []).map(c => (
                    <div key={c?._id || Math.random()} className="pp-char-card">
                        <div className="pp-char-avatar" style={{ backgroundColor: c?.avatarColor || '#06b6d4' }}>
                            {c?.name ? c.name[0].toUpperCase() : '?'}
                        </div>
                        <div className="pp-char-info">
                            <h4>{c?.name || 'Unnamed Character'}</h4>
                            <p>{c?.description || <em>No description</em>}</p>
                        </div>
                        <div className="pp-char-actions">
                            <button className="pp-icon-btn" onClick={() => { setEditTarget(c); setMode('edit'); }} title="Edit">✏️</button>
                            <button className="pp-icon-btn danger" onClick={() => handleDelete(c?._id)} disabled={deletingId === c?._id} title="Delete">
                                {deletingId === c?._id ? '…' : '🗑️'}
                            </button>
                        </div>
                    </div>
                ))}

                {(!characters || characters.length === 0) && !loading && (
                    <div className="pp-empty-state">
                        <div className="pp-empty-icon">🎭</div>
                        <h4>No custom characters yet</h4>
                        <p>Create a character with your own personality and system prompt</p>
                    </div>
                )}
            </div>
        </div>
    );
});

// ─── Tab 3: Memories ──────────────────────────────────────────────────────────

const MemoriesTab = memo(() => {
    const dispatch = useDispatch();
    const { items: memories, loading } = useSelector(s => s.memory);
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState(null);
    const [clearing, setClearing] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        dispatch(setMemoryLoading(true));
        axiosInstance.get('/memory')
            .then(r => dispatch(setMemories(r.data.memories)))
            .catch(() => { })
            .finally(() => dispatch(setMemoryLoading(false)));
    }, [dispatch]);

    const handleDelete = useCallback(async (id) => {
        setDeletingId(id);
        try {
            await axiosInstance.delete(`/memory/${id}`);
            dispatch(removeMemory(id));
            showToast('Memory deleted');
        } catch {
            showToast('Failed to delete', 'error');
        } finally { setDeletingId(null); }
    }, [dispatch]);

    const handleClearAll = useCallback(async () => {
        if (!window.confirm(`Delete all ${memories.length} memories? This cannot be undone.`)) return;
        setClearing(true);
        try {
            await Promise.all(memories.map(m => axiosInstance.delete(`/memory/${m.id}`)));
            dispatch(clearMemories());
            showToast('All memories cleared');
        } catch {
            showToast('Some memories could not be deleted', 'error');
        } finally { setClearing(false); }
    }, [dispatch, memories]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const charColors = { atomic: '#06b6d4', chandni: '#14b8a6', bhaiya: '#10b981', osho: '#f97316', jahnvi: '#0ea5e9' };

    return (
        <div className="pp-tab-content">
            <Toast {...(toast || { message: null, type: 'success' })} />
            <div className="pp-section-header">
                <div>
                    <h3>AI Memories</h3>
                    <p className="pp-section-sub">What Atomic remembers about you from your conversations</p>
                </div>
                {memories.length > 0 && (
                    <button className="pp-btn pp-btn-danger-outline" onClick={handleClearAll} disabled={clearing}>
                        {clearing ? 'Clearing…' : `Clear All (${memories.length})`}
                    </button>
                )}
            </div>

            {loading ? (
                <div className="pp-loading">Loading memories from memory store…</div>
            ) : memories.length === 0 ? (
                <div className="pp-empty-state">
                    <div className="pp-empty-icon">🧠</div>
                    <h4>No memories yet</h4>
                    <p>Start chatting and Atomic will remember things about you across conversations</p>
                </div>
            ) : (
                <div className="pp-memories-list">
                    {memories.map((m) => {
                        const char = m.metadata?.character || 'atomic';
                        const isCustom = char.startsWith('custom:');
                        const charLabel = isCustom ? 'Custom' : char;
                        const charColor = isCustom ? '#8b5cf6' : (charColors[char] || '#06b6d4');

                        return (
                            <div key={m.id} className="pp-memory-card">
                                <div className="pp-memory-body">
                                    <span className="pp-char-tag" style={{ borderColor: charColor, color: charColor }}>
                                        {charLabel}
                                    </span>
                                    <p className="pp-memory-text">
                                        {m.metadata?.message?.slice(0, 200)}
                                        {m.metadata?.message?.length > 200 ? '…' : ''}
                                    </p>
                                    {m.metadata?.createdAt && (
                                        <span className="pp-memory-date">{formatDate(m.metadata.createdAt)}</span>
                                    )}
                                </div>
                                <button
                                    className="pp-icon-btn danger"
                                    onClick={() => handleDelete(m.id)}
                                    disabled={deletingId === m.id}
                                    title="Delete memory"
                                >
                                    {deletingId === m.id ? '…' : '🗑️'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
});

// ─── Tab 4: Security ──────────────────────────────────────────────────────────

const SecurityTab = memo(({ user }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [oldPwd, setOldPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPwd !== confirmPwd) return showToast('New passwords do not match', 'error');
        if (newPwd.length < 6) return showToast('Password must be at least 6 characters', 'error');
        setSaving(true);
        try {
            await axiosInstance.put('/auth/change-password', { oldPassword: oldPwd, newPassword: newPwd });
            showToast('Password changed! Please log in again.');
            setOldPwd(''); setNewPwd(''); setConfirmPwd('');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to change password', 'error');
        } finally { setSaving(false); }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm('Are you absolutely sure? This will permanently delete your account, all chats, and memories.');
        if (!confirmed) return;
        const doubleConfirm = window.prompt(`Type your email "${user?.email}" to confirm account deletion:`);
        if (doubleConfirm !== user?.email) return showToast('Email did not match. Account NOT deleted.', 'error');

        setDeleting(true);
        try {
            await axiosInstance.delete('/auth/account');
            dispatch(logout());
            dispatch(clearChatStore());
            localStorage.removeItem('user');
            navigate('/login');
        } catch (err) {
            showToast('Failed to delete account', 'error');
            setDeleting(false);
        }
    };

    const isGoogleUser = !user?.passwordHash && user?.picture;

    return (
        <div className="pp-tab-content">
            <Toast {...(toast || { message: null, type: 'success' })} />

            <section className="pp-section">
                <h3>Change Password</h3>
                {isGoogleUser ? (
                    <div className="pp-info-box">Password changes are not available for Google accounts.</div>
                ) : (
                    <form className="pp-form" onSubmit={handleChangePassword}>
                        <div className="pp-field">
                            <label>Current Password</label>
                            <input type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} placeholder="Current password" required />
                        </div>
                        <div className="pp-field">
                            <label>New Password</label>
                            <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Min 6 characters" required />
                        </div>
                        <div className="pp-field">
                            <label>Confirm New Password</label>
                            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Repeat new password" required />
                        </div>
                        <button type="submit" className="pp-btn pp-btn-primary" disabled={saving}>
                            {saving ? 'Changing…' : 'Change Password'}
                        </button>
                    </form>
                )}
            </section>

            <section className="pp-section pp-danger-zone">
                <h3>⚠️ Danger Zone</h3>
                <div className="pp-danger-card">
                    <div>
                        <strong>Delete Account</strong>
                        <p>Permanently deletes your account, all chats, and all Pinecone memories. This cannot be undone.</p>
                    </div>
                    <button className="pp-btn pp-btn-danger" onClick={handleDeleteAccount} disabled={deleting}>
                        {deleting ? 'Deleting…' : 'Delete Account'}
                    </button>
                </div>
            </section>
        </div>
    );
});

// ─── Main ProfilePage ─────────────────────────────────────────────────────────

const TABS = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'characters', label: '🎭 Characters' },
    { id: 'memories', label: '🧠 Memories' },
    { id: 'security', label: '🔒 Security' },
];

const ProfilePage = () => {
    const navigate = useNavigate();
    const user = useSelector(s => s.auth.user);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab && TABS.some(t => t.id === tab)) setActiveTab(tab);
    }, []);

    const handleTabChange = (id) => {
        setActiveTab(id);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', id);
        window.history.replaceState({}, '', url.toString());
    };

    return (
        <div className="pp-page">
            <div className="pp-container">
                {/* Header */}
                <div className="pp-header">
                    <button className="pp-back-btn" onClick={() => navigate('/')}>← Back to Chat</button>
                    <h1 className="pp-title">Profile & Settings</h1>
                </div>

                {/* Tabs */}
                <div className="pp-tabs">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            className={`pp-tab-btn ${activeTab === t.id ? 'active' : ''}`}
                            onClick={() => handleTabChange(t.id)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="pp-card">
                    {activeTab === 'profile' && <ProfileTab user={user} />}
                    {activeTab === 'characters' && <CharactersTab />}
                    {activeTab === 'memories' && <MemoriesTab />}
                    {activeTab === 'security' && <SecurityTab user={user} />}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
