import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { cn } from '@/lib/utils';
import { getAgentConfig, createAgent } from '../../redux/actions/agentAction';
import { X, Bot, Sparkles, Check, Send } from 'lucide-react';

const EASE_OUT = 'cubic-bezier(0,0,0.2,1)';

// Refactored Steps Configuration
// Easily add new steps or complex multi-input steps here
const STEPS = [
  { id: 'name', text: "Hello! Let's create a new agent. What should we name it?", type: 'text' },
  { id: 'description', text: "Got it! How would you describe what this agent does?", type: 'text' },
  { id: 'thumbnail', text: "Please select an image for this agent (or click skip)", type: 'image_upload' },
  { id: 'model', text: "Which base model would you like to use?", type: 'model' },
  { id: 'systemPrompt', text: "What should be the system prompt (instructions) for this agent?", type: 'text' },
  { id: 'tools', text: "Select any tools this agent can use. Click 'Done Selecting' when finished.", type: 'tools' },
  { id: 'confirm', text: "Awesome! The configuration is ready. Should I create the agent now?", type: 'confirm' }
];

export default function CreateAgentModal({ open, onClose }) {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const chatEndRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    thumbnail: '',
    model: 'gemini-2.5-flash',
    systemPrompt: '',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1,
    tools: []
  });

  // Initialization & Data Fetching
  useEffect(() => {
    if (open && !config) {
      setLoading(true);
      dispatch(getAgentConfig())
        .then((res) => {
          if (res?.data && res.data.length > 0) {
            setConfig(res.data[0]);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, dispatch, config]);

  // Start Chat
  useEffect(() => {
    if (open && !loading) {
      setTimeout(() => {
        if (messages.length === 0) {
          setMessages([{ id: Date.now(), sender: 'bot', text: STEPS[0].text, stepId: STEPS[0].id, qType: STEPS[0].type }]);
        }
      }, 50);
    }
  }, [open, loading]);

  // Reset on Close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setCurrentStep(0);
        setMessages([]);
        setInputValue('');
        setFormData({
          name: '', description: '', thumbnail: '', model: 'gemini-2.5-flash',
          systemPrompt: '', temperature: 0.7, maxTokens: 2048, topP: 1, tools: []
        });
      }, 400);
    }
  }, [open]);

  // Auto Scroll
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleTool = (toolName) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(toolName)
        ? prev.tools.filter(t => t !== toolName)
        : [...prev.tools, toolName]
    }));
  };

  const handleSend = (textOverride) => {
    const text = typeof textOverride === 'string' ? textOverride : inputValue;
    const currentStepConfig = STEPS[currentStep];

    if (!text.trim() && currentStepConfig.type === 'text') return;

    let displayUserText = text.trim();
    if (currentStepConfig.type === 'tools') {
      const count = formData.tools.length;
      displayUserText = count > 0 ? `✓ Selected ${count} tool${count !== 1 ? 's' : ''}` : "No tools selected";
    }

    // Add user message
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: displayUserText }]);

    // Update form state if it's a basic text step
    if (currentStepConfig.type === 'text') {
      let val = displayUserText;
      if (currentStepConfig.id === 'thumbnail' && val.toLowerCase() === 'skip') val = '';
      setFormData(prev => ({ ...prev, [currentStepConfig.id]: val }));
    }

    setInputValue('');

    // Trigger next step
    const nextStep = currentStep + 1;
    if (nextStep < STEPS.length) {
      setCurrentStep(nextStep);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'bot',
          text: STEPS[nextStep].text,
          stepId: STEPS[nextStep].id,
          qType: STEPS[nextStep].type
        }]);
      }, 500);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('description', formData.description);
      if (formData.thumbnail && typeof formData.thumbnail !== 'string') {
        payload.append('thumbnail', formData.thumbnail);
      }
      payload.append('tools', JSON.stringify(formData.tools));
      payload.append('settings', JSON.stringify({
        model: formData.model,
        systemPrompt: formData.systemPrompt,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens,
        topP: formData.topP,
      }));

      await dispatch(createAgent(payload));

      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: "Agent created successfully! 🎉 Closing...",
        qType: 'success'
      }]);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: "Oops, something went wrong while creating the agent.",
        qType: 'error'
      }]);
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------------
  // UI Refactor: Abstracted Custom UI Components
  // ------------------------------------------------------------------
  const renderStepUI = (msg) => {
    switch (msg.qType) {
      case 'image_upload':
        return (
          <div className="flex flex-col gap-2 mt-2 w-full sm:w-[280px]">
            <input type="file" accept="image/*" onChange={(e) => {
               if(e.target.files && e.target.files[0]) {
                 setFormData(prev => ({ ...prev, thumbnail: e.target.files[0] }));
                 handleSend("Image Selected");
               }
            }} className="text-white text-[13px] bg-white/5 p-2 rounded-lg border border-white/10" />
            <button
              onClick={() => {
                setFormData(prev => ({ ...prev, thumbnail: "" }));
                handleSend("skip");
              }}
              className="mt-1 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[13px] font-medium transition-all"
            >
              Skip
            </button>
          </div>
        );

      case 'model':
        return (
          <div className="flex flex-col gap-1.5 mt-2 w-full sm:w-[280px]">
            {(config?.models || [{ modelId: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' }]).map(m => (
              <button
                key={m.modelId}
                onClick={() => {
                  setFormData(prev => ({ ...prev, model: m.modelId }));
                  handleSend(m.name);
                }}
                className="text-left px-3 py-2.5 text-[13px] text-white/80 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] rounded-lg transition-all"
              >
                {m.name}
              </button>
            ))}
          </div>
        );

      case 'tools':
        const allToolNames = (config?.tools || []).map(t => t.name);
        const allSelected = allToolNames.length > 0 && allToolNames.every(n => formData.tools.includes(n));
        
        const toolColors = [
          { accent: '#818cf8', glow: 'rgba(99,102,241,0.18)' },    // violet
          { accent: '#2dd4bf', glow: 'rgba(20,184,166,0.18)' },    // teal
          { accent: '#fb923c', glow: 'rgba(249,115,22,0.18)' },    // orange
          { accent: '#f472b6', glow: 'rgba(236,72,153,0.18)' },    // pink
          { accent: '#4ade80', glow: 'rgba(34,197,94,0.18)' },     // green
          { accent: '#facc15', glow: 'rgba(234,179,8,0.18)' },     // yellow
          { accent: '#60a5fa', glow: 'rgba(59,130,246,0.18)' },    // blue
          { accent: '#c084fc', glow: 'rgba(168,85,247,0.18)' },    // purple
        ];

        return (
          <div className="flex flex-col gap-2 mt-2 w-full">
            {/* Header row: count + select all */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/40">
                {formData.tools.length} of {allToolNames.length} selected
              </span>
              <button
                onClick={() => setFormData(prev => ({ ...prev, tools: allSelected ? [] : allToolNames }))}
                className="text-[11px] font-semibold text-white/60 hover:text-white transition-colors px-2 py-0.5 rounded-md hover:bg-white/10 border border-white/10"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Tool list — single column compact cards */}
            <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-white/10">
              {(config?.tools || []).map((tool, idx) => {
                const isSelected = formData.tools.includes(tool.name);
                const color = toolColors[idx % toolColors.length];
                return (
                  <div
                    key={tool.name}
                    onClick={() => toggleTool(tool.name)}
                    className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                    style={{
                      background: isSelected ? color.glow : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? color.accent + '60' : 'rgba(255,255,255,0.06)'}`,
                      borderLeft: `3px solid ${color.accent}`,
                    }}
                  >
                    {/* Tool info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-white truncate">{tool.name}</div>
                      <div className="text-[10px] text-white/40 truncate mt-0.5">
                        {tool.description?.substring(0, 60)}...
                      </div>
                    </div>
                    {/* Checkbox */}
                    <div
                      className="w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 transition-all"
                      style={{
                        background: isSelected ? color.accent : 'rgba(255,255,255,0.08)',
                      }}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3] text-black" />}
                    </div>
                  </div>
                );
              })}
              {(!config?.tools || config.tools.length === 0) && (
                <div className="p-4 text-center text-[12px] text-white/40 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                  No tools available.
                </div>
              )}
            </div>

            <button
              onClick={() => handleSend()}
              className="w-full py-2.5 bg-white text-black rounded-xl text-[13px] font-semibold hover:bg-white/90 transition-all"
            >
              Done Selecting ({formData.tools.length} tools)
            </button>
          </div>
        );

      case 'confirm':
        return (
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => handleSubmit()}
              disabled={saving}
              className="px-4 py-2 bg-white text-black rounded-lg text-[13px] font-semibold hover:bg-white/90 transition-all flex items-center gap-2"
            >
              {saving ? <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Yes, create it
            </button>
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-[13px] font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        );
        
      // Example of how to easily add complex multi-input forms inside the chat later
      case 'custom_form': 
        return (
           <div className="mt-2 space-y-2 p-3 bg-white/5 rounded-lg border border-white/10 w-full sm:w-[280px]">
              {/* Insert multiple standard inputs, sliders, or advanced settings here */}
              <button onClick={() => handleSend("Saved custom settings")} className="w-full py-1.5 bg-white text-black text-xs rounded">Save Details</button>
           </div>
        );

      default:
        return null;
    }
  };

  const isInputDisabled = STEPS[currentStep] && ['model', 'tools', 'confirm'].includes(STEPS[currentStep].type) || saving;
  const placeholder = isInputDisabled ? "Select an option above..." : "Type your answer...";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center transition-opacity px-4",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      style={{ transitionDuration: '400ms', transitionTimingFunction: EASE_OUT }}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionDuration: '400ms', transitionTimingFunction: EASE_OUT }}
        onClick={!saving ? onClose : undefined}
      />

      {/* Modal Container */}
      <div
        className={cn(
          "relative w-full max-w-2xl shadow-2xl transition-all flex flex-col overflow-hidden",
          "h-[90vh] sm:h-[560px] max-h-full rounded-2xl bg-[#0a1118] border border-white/10",
          open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        )}
        style={{
          transitionDuration: '350ms',
          transitionTimingFunction: EASE_OUT,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06] z-10 shrink-0 bg-[#0a1118]">
          <h2 className="text-[14px] font-medium text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded-[6px] bg-white/[0.05] flex items-center justify-center border border-white/[0.08]">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            Agent Creator
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] hover:bg-white/10 text-white/50 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10">
          {loading && !config ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-3 animate-pulse">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-white/40 text-[13px]">Loading workspace...</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={msg.id} className={cn("flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300", msg.sender === 'user' ? "justify-end" : "justify-start")}>
                
                {/* Bot Avatar */}
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10 mr-3 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className={cn("flex flex-col gap-1 w-full", msg.sender === 'user' ? "items-end" : "items-start max-w-[85%]")}>
                  
                  {/* The actual text bubble */}
                  <div
                    className={cn(
                      "px-4 py-2.5 text-[13px] leading-relaxed",
                      msg.sender === 'user'
                        ? "bg-white text-black rounded-2xl rounded-tr-sm font-medium"
                        : "bg-white/5 border border-white/5 text-white/90 rounded-2xl rounded-tl-sm"
                    )}
                  >
                    {msg.text}
                  </div>

                  {/* Dynamic Custom UI Block rendering */}
                  {msg.sender === 'bot' && idx === messages.length - 1 && renderStepUI(msg)}
                
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} className="h-4 shrink-0" />
        </div>

        {/* Input Form */}
        <div className="p-3 border-t border-white/[0.06] bg-[#0a1118] shrink-0 mt-auto">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center w-full"
          >
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={isInputDisabled || loading}
              placeholder={placeholder}
              className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-white/[0.2] focus:bg-white/[0.05] rounded-full pl-4 pr-12 py-3 text-[13px] text-white outline-none placeholder:text-white/30 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isInputDisabled || loading}
              className="absolute right-1.5 w-8 h-8 flex items-center justify-center bg-white text-black rounded-full disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}