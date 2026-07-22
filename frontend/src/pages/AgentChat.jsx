import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PromptInput } from '../components/ui/ai-chat-input';
import AgentSidebar, { AgentSidebarToggle } from '../components/ui/AgentSidebar';
import CreateAgentModal from '../components/ui/CreateAgentModal';
import ManageAgentsModal from '../components/ui/ManageAgentsModal';
import { getAgents } from '../redux/actions/agentAction';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import CodeBlock from '../components/chat/CodeBlock';

const CopyIcon = ({ copied }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {copied ? (
            <path d="M20 6L9 17l-5-5" />
        ) : (
            <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>
        )}
    </svg>
);

const AgentMessageBubble = ({ msg, isUser }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
      navigator.clipboard.writeText(msg?.message || '').then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[85%] rounded-2xl px-4 py-3 text-sm text-white/90 shrink-0 group ${
          isUser 
            ? 'backdrop-blur-md border border-white/10 shadow-lg' 
            : msg?.isError 
              ? 'bg-red-500/10 border border-red-500/20 text-red-200' 
              : 'bg-transparent'
        }`}
        style={isUser ? { background: 'rgba(255,255,255,0.05)' } : {}}
      >
        <div className="flex items-center justify-between mb-1 gap-4">
          <p className={`font-semibold text-xs ${isUser ? 'text-white/60' : msg?.isError ? 'text-red-400/80' : 'text-white/40'}`}>
            {isUser ? 'You' : (msg?.agent?.agentName || 'Unknown Agent')}
          </p>
          {!isUser && (
            <button 
              onClick={handleCopy} 
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-md text-white/40 hover:text-white"
              title="Copy message"
            >
              <CopyIcon copied={copied} />
            </button>
          )}
        </div>
        
        <div className="prose prose-invert max-w-none text-[14px] leading-relaxed">
          {isUser ? (
            <p>{msg?.message}</p>
          ) : (
            <ReactMarkdown
                children={msg?.message || ''}
                components={{
                    code(props) {
                        const { children, className, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        if (match) {
                            return (
                                <CodeBlock language={match[1]}>
                                    {String(children).replace(/\n$/, '')}
                                </CodeBlock>
                            );
                        }
                        return <code {...rest} className={cn("bg-white/10 rounded px-1.5 py-0.5 text-[13px] font-mono", className)}>{children}</code>;
                    },
                }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const AgentChat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { agents, agentChatData, agentStatus } = useSelector((state) => state.agent);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateAgentOpen, setIsCreateAgentOpen] = useState(false);
  const [isManageAgentsOpen, setIsManageAgentsOpen] = useState(false);
  const feedEndRef = useRef(null);

  useEffect(() => {
    dispatch(getAgents()).catch(console.error);
  }, [dispatch]);

  const agentModels = useMemo(() => {
    return agents?.map(a => a) || [];
  }, [agents]);

  // UI FIX: The layout now listens to Redux data, NOT an empty local state array
  const hasActiveChat = agentChatData && agentChatData.length > 0;

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentChatData, agentStatus]);

  const handleSubmit = (value, meta) => {
    if (!value.trim() && meta.attachments.length === 0) return;
    // Input handling happens inside PromptInput
  };

  return (
    <div className={`ai-chat-scope agent-page ${hasActiveChat ? 'chat-active' : 'chat-initial'}`}>

      <div className="absolute left-4 top-4 z-30 sm:left-6 sm:top-6">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to chat
        </button>
      </div>

      <div className={`agent-input-glow ${hasActiveChat ? 'hidden-glow' : ''}`} aria-hidden="true" />

      <AgentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <CreateAgentModal open={isCreateAgentOpen} onClose={() => setIsCreateAgentOpen(false)} />
      <ManageAgentsModal open={isManageAgentsOpen} onClose={() => setIsManageAgentsOpen(false)} />

      <div className="agent-content">

        <div className={`agent-message-feed flex flex-col gap-4 ${hasActiveChat ? 'agent-message-feed--active' : 'agent-message-feed--idle'}`}>
          {agentChatData?.map((msg, index) => {
            const isUser = msg?.role === 'user';
            return <AgentMessageBubble key={index} msg={msg} isUser={isUser} />;
          })}
          
          {agentStatus && (
            <div className="flex w-full justify-start">
              <div className="px-4 py-2 text-sm text-white/70 flex items-center gap-3 bg-transparent">
                <div className="size-2 rounded-full bg-primary animate-ping"></div>
                <p className="text-xs font-medium italic">{agentStatus}</p>
              </div>
            </div>
          )}

          <div ref={feedEndRef} />
        </div>

        <div className={`agent-bottom-stack w-full flex flex-col items-center gap-3 px-4 pb-3 sm:pb-4 shrink-0 z-20 relative ${!hasActiveChat ? 'agent-bottom-stack--centered' : 'agent-bottom-stack--bottom'}`}>
          {!hasActiveChat && (
            <p className="text-center text-sm sm:text-base font-medium text-white/80">
              Hi, I&apos;m Kael by Atomic. How can I help you?
            </p>
          )}

          <div className="w-full max-w-lg flex justify-center shrink-0 relative">
            <PromptInput 
              onSubmit={handleSubmit} 
              placeholder="Ask anything..." 
              onCreateAgent={() => setIsCreateAgentOpen(true)}
              onManageAgents={() => setIsManageAgentsOpen(true)}
              models={agentModels}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AgentChat;

// export default AgentChat;
