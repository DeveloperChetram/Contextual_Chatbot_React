import React from 'react';
import { cn } from '@/lib/utils';

// ─── Dummy chat history ───────────────────────────────────────────────────────
const CHAT_HISTORY = {
  Today: [
    { id: 1, title: 'How to implement RAG pipelines' },
    { id: 2, title: 'React 19 concurrent features deep dive' },
    { id: 3, title: 'Tailwind CSS v4 migration guide' },
  ],
  Yesterday: [
    { id: 4, title: 'Build a Next.js app with AI integration' },
    { id: 5, title: 'PostgreSQL query optimisation tips' },
  ],
  'Last week': [
    { id: 6, title: 'Docker multi-stage build patterns' },
    { id: 7, title: 'TypeScript generics — advanced patterns' },
    { id: 8, title: 'Kubernetes pod scheduling strategies' },
    { id: 9, title: 'WebSocket vs Server-Sent Events' },
  ],
};

// ─── Icons ────────────────────────────────────────────────────────────────────
function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function LogoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export function AgentSidebarToggle({ onClick, open }) {
  return (
    <button
      onClick={onClick}
      className={cn("agent-sidebar-toggle", open && "agent-sidebar-toggle--hidden")}
      aria-label="Open sidebar"
    >
      <MenuIcon />
    </button>
  );
}

export default function AgentSidebar({ open, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn('agent-sidebar-backdrop', open && 'agent-sidebar-backdrop--open')}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside className={cn('agent-sidebar', open && 'agent-sidebar--open')} aria-label="Chat history">

        {/* ── Header ── */}
        <div className="agent-sidebar-header">
          <div className="agent-sidebar-logo">
            <LogoIcon />
            <span>Agent</span>
          </div>
          <button className="agent-sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
            <CloseIcon />
          </button>
        </div>

        {/* ── New Chat ── */}
        <button className="agent-sidebar-new-chat">
          <PlusIcon />
          <span>New chat</span>
        </button>

        {/* ── History ── */}
        <nav className="agent-sidebar-nav">
          {Object.entries(CHAT_HISTORY).map(([section, chats], si) => (
            <div
              key={section}
              className={cn('agent-sidebar-section', open && 'agent-sidebar-section--animate')}
              style={{ '--section-delay': `${si * 70}ms` }}
            >
              <p className="agent-sidebar-section-label">{section}</p>
              {chats.map((chat, i) => (
                <button
                  key={chat.id}
                  className={cn('agent-sidebar-item', open && 'agent-sidebar-item--animate')}
                  style={{ '--item-delay': `${si * 70 + i * 40 + 60}ms` }}
                  aria-label={chat.title}
                >
                  <span className="agent-sidebar-item-icon"><ChatBubbleIcon /></span>
                  <span className="agent-sidebar-item-title">{chat.title}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* ── Footer / profile ── */}
        <div className="agent-sidebar-footer">
          <div className="agent-sidebar-profile">
            <div className="agent-sidebar-avatar">C</div>
            <div className="agent-sidebar-profile-info">
              <p className="agent-sidebar-profile-name">Chetram</p>
              <p className="agent-sidebar-profile-plan">Free plan</p>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
