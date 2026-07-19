import * as React from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { io } from "socket.io-client";
import { useDispatch , useSelector} from "react-redux";
import { addAgentChatData, setAgentStatus } from "@/redux/reducers/agentSlice";

const SPRING_TRANSITION = "max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
const SMOOTH_HEIGHT_TRANSITION = "max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.15s ease-out";


export const PromptInput = React.forwardRef((
  { onSubmit, placeholder = "Ask anything", className, models = [], efforts = ["Low", "Medium", "Max Effort"], defaultValue = "", value: controlledValue, onChange, maxAttachments = 6, onCreateAgent, onManageAgents },
  ref
) => {

  console.log('models', models)

  const [socket, setSocket] = useState(null);
  const [agentResponse, setAgentResponse] = useState(null);

  // __________socket instance__________

  const dispatch = useDispatch();
  const agentChatData = useSelector((state) => state.agent.agentChatData);
  console.log('agent chat data ',agentChatData)
  useEffect(() => {
    // if (!isAuthenticated) return;
    // dispatch(getChats());
    const backendUrl = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:3000`;
    // const socketUrl = `http://${window.location.hostname}:3000`;
    const socketUrl = backendUrl.replace('/api', '');
    const newSocket = io(socketUrl, { withCredentials: true });
    newSocket.on('connect', () => {
      console.log('Connected to server' + newSocket.id);
    });
    newSocket.on('agent-status', (res) => {
      dispatch(setAgentStatus(res.status));
    });
    newSocket.on('agent-response', (res) => {
      dispatch(setAgentStatus("")); // clear status
      dispatch(addAgentChatData({ agent: {agentName:res.agent.agentName, agentId: res.agent.agentId}, message: res.agentResponse, role: 'agent' }));
    });
    newSocket.on('agent-error', (res) => {
      dispatch(setAgentStatus(""));
      dispatch(addAgentChatData({ agent: res.agent, message: `⚠️ ${res.message}`, role: 'agent', isError: true }));
    });
    
    newSocket.on('connect_error', (err) => {
      console.error("Socket Connection Error:", err.message);
      dispatch(setAgentStatus("Connection Error: " + err.message));
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [dispatch]);



  // const socket = io('http://localhost:3000') 



  // _____________________________________


  const [expanded, setExpanded] = useState(true);
  const [isSmoothResize, setIsSmoothResize] = useState(false);
  const [localValue, setLocalValue] = useState(defaultValue);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  
  // Auto-select the first model when models are loaded asynchronously
  useEffect(() => {
    if (!selectedModel && models && models.length > 0) {
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel]);
  
  console.log('selected modelsl', selectedModel)
  const [effortIndex, setEffortIndex] = useState(1);
  const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [activeAttachment, setActiveAttachment] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState(new Array(5).fill(0));
  const valueRef = useRef(controlledValue !== undefined ? controlledValue : localValue);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const rafRef = useRef(null);
  const recognitionRef = useRef(null);
  const demoIntervalRef = useRef(null);
  const demoTextIntervalRef = useRef(null);
  const [hoverStyle, setHoverStyle] = useState({
    opacity: 0,
    transform: "translateY(0px)",
    height: 32,
  });
  const [containerHeight, setContainerHeight] = useState(100);
  const [textareaHeight, setTextareaHeight] = useState(52);
  const [isScrolling, setIsScrolling] = useState(false);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : localValue;
  const hasValue = value.trim() !== "" || attachments.length > 0;
  const hasAttachments = attachments.length > 0;
  const textareaRef = useRef(null);
  const internalContainerRef = useRef(null);
  const topFadeRef = useRef(null);
  const bottomFadeRef = useRef(null);
  const fileInputRef = useRef(null);
  const thumbRefs = useRef(new Map());

  // console.log(value)
  useEffect(() => { valueRef.current = value; }, [value]);

  const updateFades = () => {
    const el = textareaRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (topFadeRef.current) topFadeRef.current.style.opacity = Math.min(scrollTop / 20, 1).toString();
    if (bottomFadeRef.current) {
      const bottomScroll = scrollHeight - clientHeight - scrollTop;
      bottomFadeRef.current.style.opacity = Math.min(Math.max(bottomScroll - 16, 0) / 10, 1).toString();
    }
  };

  const handleValueChange = useCallback((val) => {
    // console.log(val)
    setIsSmoothResize(true);
    if (!isControlled) setLocalValue(val);
    onChange?.(val);
  }, [isControlled, onChange]);

  const expand = () => { setIsSmoothResize(false); setExpanded(true); };

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    if (demoIntervalRef.current) { window.clearInterval(demoIntervalRef.current); demoIntervalRef.current = null; }
    if (demoTextIntervalRef.current) { window.clearInterval(demoTextIntervalRef.current); demoTextIntervalRef.current = null; }
    setIsRecording(false);
    setAudioData(new Array(5).fill(0));
  }, []);

  const startRecording = useCallback(async () => {
    setIsSmoothResize(false); setExpanded(true);
    let stream = null;
    try {
      if (navigator.mediaDevices?.getUserMedia) stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch { console.warn("Mic unavailable, using simulated mode."); }
    setIsRecording(true);

    function simulateText() {
      const fakeText = "Can you build a high fidelity Framer Motion layout animation for a dark mode dashboard?";
      const words = fakeText.split(" ");
      let i = 0; let currentBase = valueRef.current;
      demoTextIntervalRef.current = window.setInterval(() => {
        if (i < words.length) { currentBase = (currentBase ? currentBase + " " : "") + words[i]; handleValueChange(currentBase); i++; }
        else stopRecording();
      }, 300);
    }

    if (stream) {
      streamRef.current = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx(); audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser(); analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream); source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVisualizer = () => {
        analyser.getByteFrequencyData(dataArray);
        const bands = new Array(5).fill(0); const step = Math.floor(dataArray.length / 5);
        for (let i = 0; i < 5; i++) { let sum = 0; for (let j = 0; j < step; j++) sum += dataArray[i * step + j]; bands[i] = sum / step / 255; }
        setAudioData(bands); rafRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition(); recognition.continuous = true; recognition.interimResults = true;
        let baseline = valueRef.current;
        recognition.onresult = (event) => {
          let interimTranscript = ""; let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
            else interimTranscript += event.results[i][0].transcript;
          }
          if (finalTranscript) baseline += (baseline ? " " : "") + finalTranscript;
          handleValueChange((baseline + (interimTranscript ? " " + interimTranscript : "")).trim());
        };
        recognition.onerror = () => stopRecording();
        recognition.onend = () => stopRecording();
        recognitionRef.current = recognition; recognition.start();
      } else { simulateText(); }
    } else {
      demoIntervalRef.current = window.setInterval(() => { setAudioData(Array.from({ length: 5 }, () => Math.random() * 0.8 + 0.1)); }, 100);
      simulateText();
    }
  }, [handleValueChange, stopRecording]);

  useEffect(() => { if (isRecording && textareaRef.current) textareaRef.current.scrollTop = textareaRef.current.scrollHeight; }, [value, isRecording]);
  useEffect(() => { return () => { stopRecording(); attachments.forEach((a) => URL.revokeObjectURL(a.url)); }; }, [stopRecording, attachments]);
  useEffect(() => { if ((value.trim() !== "" || hasAttachments) && !expanded) { setIsSmoothResize(false); setExpanded(true); } }, [value, expanded, hasAttachments]);
  useEffect(() => {
    if (expanded && !isRecording) {
      const timer = setTimeout(() => { if (textareaRef.current) { textareaRef.current.focus(); const l = textareaRef.current.value.length; textareaRef.current.setSelectionRange(l, l); } }, 50);
      return () => clearTimeout(timer);
    }
  }, [expanded, isRecording]);

  useEffect(() => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const currentHeight = el.style.height;
    el.style.transition = "none"; el.style.height = "0px";
    const scrollHeight = el.scrollHeight;
    el.style.height = currentHeight; void el.offsetHeight; el.style.transition = "";
    const newHeight = Math.max(52, Math.min(scrollHeight, 160));
    el.style.height = `${newHeight}px`;
    setTextareaHeight(newHeight); setIsScrolling(scrollHeight > 160);
    setTimeout(updateFades, 0);
  }, [value, expanded]);

  useEffect(() => { setContainerHeight(Math.max(100, textareaHeight + 48)); setTimeout(updateFades, 0); }, [textareaHeight]);

  useEffect(() => {
    if (!isModelSelectOpen) return;
    const handleOutsideClick = (e) => { if (internalContainerRef.current && !internalContainerRef.current.contains(e.target)) setIsModelSelectOpen(false); };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isModelSelectOpen]);

  const handleBlur = (e) => {
    if (internalContainerRef.current?.contains(e.relatedTarget)) return;
    if (value.trim() === "" && !hasAttachments && !isRecording) { setIsSmoothResize(false); setExpanded(false); setIsModelSelectOpen(false); }
  };

  const handleInputSubmit = () => {
    console.log("Submitted value:", value);
    if (socket) {
      socket.emit('agent-chat', {
        message: value,
        agentId: selectedModel?._id,
        
      })

      dispatch(addAgentChatData({
        message: value,
        role: 'user'
      }))


    }
    if (value.trim() === "" && !hasAttachments) return;
    setIsSmoothResize(false);
    onSubmit?.(value, { model: selectedModel, effort: efforts[effortIndex], attachments: attachments.map((a) => a.file) });
    handleValueChange("");
    attachments.forEach((a) => URL.revokeObjectURL(a.url));
    setAttachments([]); setExpanded(false); setIsModelSelectOpen(false);
    textareaRef.current?.blur();
  };

  const cycleEffort = (e) => { e.stopPropagation(); setEffortIndex((prev) => (prev + 1) % efforts.length); };
  const openFileChooser = (e) => { e.stopPropagation(); fileInputRef.current?.click(); };

  const handleFilesChosen = async (e) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    e.target.value = "";
    if (files.length === 0) return;
    const room = Math.max(0, maxAttachments - attachments.length);
    const accepted = files.slice(0, room);
    if (!expanded) { setIsSmoothResize(false); setExpanded(true); } else setIsSmoothResize(true);
    for (const file of accepted) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => addAttachment(file, url, img.naturalWidth, img.naturalHeight);
      img.onerror = () => addAttachment(file, url, 800, 600);
      img.src = url;
    }
  };

  const addAttachment = (file, url, width, height) => {
    const id = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;
    setAttachments((prev) => [...prev, { id, file, url, name: file.name, width, height }]);
  };

  const removeAttachment = (id) => {
    setIsSmoothResize(true);
    setAttachments((prev) => { const target = prev.find((a) => a.id === id); if (target) URL.revokeObjectURL(target.url); return prev.filter((a) => a.id !== id); });
    thumbRefs.current.delete(id);
  };

  const showArrow = hasValue; // Show arrow when there's text
  const showStop =  false;
  const showMic =  false;

  const onActionButtonClick = (e) => {
    e.preventDefault();
    // Voice mode disabled
    // if (isRecording) stopRecording();
    // else if (hasValue) handleInputSubmit();
    // else startRecording();
    if (hasValue) handleInputSubmit();
  };

  return (
    <>
      <div
        ref={(node) => { if (typeof ref === "function") ref(node); else if (ref) ref.current = node; internalContainerRef.current = node; }}
        onBlur={handleBlur}
        className={cn("relative flex flex-col w-full", className)}
        style={{ maxWidth: expanded ? 480 : 320, transition: isSmoothResize ? "max-width 0.15s ease-out" : "max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
      >
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFilesChosen} className="hidden" tabIndex={-1} aria-hidden="true" />

        <div
          aria-hidden={!hasAttachments}
          style={{ height: hasAttachments && expanded ? 68 : 0, transition: isSmoothResize ? "height 0.15s ease-out" : "height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
          className="w-full relative z-0 overflow-hidden"
        >
          <div
            style={{ position: "absolute", bottom: -8, left: 20, right: 20, height: 68, transform: hasAttachments && expanded ? "translateY(0)" : "translateY(100%)", opacity: hasAttachments && expanded ? 1 : 0, transition: isSmoothResize ? "transform 0.15s ease-out, opacity 0.15s ease-out" : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease-out" }}
            className="border border-border border-b-0 bg-muted rounded-t-2xl px-2 pt-2 pb-1 flex items-start gap-2 overflow-x-auto prompt-scrollbar"
          >
            {attachments.map((attachment, index) => (
              <AttachmentThumb key={attachment.id} attachment={attachment} index={index} onRemove={removeAttachment} onOpen={(a, rect) => setActiveAttachment({ attachment: a, rect })} registerRef={(id, el) => thumbRefs.current.set(id, el)} />
            ))}
          </div>
        </div>

        <div
          onMouseDown={(e) => { const isTextarea = e.target === textareaRef.current; if (expanded && !isTextarea && !isRecording) { e.preventDefault(); textareaRef.current?.focus(); } }}
          style={{ borderRadius: 24, height: expanded ? containerHeight : 48, transition: isSmoothResize ? SMOOTH_HEIGHT_TRANSITION : SPRING_TRANSITION, overflow: expanded ? "visible" : "hidden" }}
          className={cn("relative w-full border border-border bg-card shadow-sm focus-within:border-ring/40 focus-within:ring-1 focus-within:ring-ring/20 hover:border-border/80 z-10", expanded ? "cursor-text" : "cursor-default")}
        >
          <style dangerouslySetInnerHTML={{ __html: `.prompt-scrollbar::-webkit-scrollbar{width:4px;height:4px;background:transparent}.prompt-scrollbar::-webkit-scrollbar-track{background:transparent}.prompt-scrollbar::-webkit-scrollbar-thumb{background:transparent;border-radius:4px}.prompt-scrollbar:hover::-webkit-scrollbar-thumb{background:hsl(var(--muted-foreground)/0.3)}` }} />

          <textarea
            ref={textareaRef} value={value} onChange={(e) => handleValueChange(e.target.value)} onScroll={updateFades}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleInputSubmit(); }
              if (e.key === "Escape" && value.trim() === "" && !hasAttachments) { setIsSmoothResize(false); setExpanded(false); setIsModelSelectOpen(false); }
            }}
            placeholder={placeholder} aria-label="Prompt" disabled={isRecording}
            style={{ transition: isSmoothResize ? "height 0.15s ease-out" : "opacity 0.3s ease-out, transform 0.3s ease-out, height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
            className={cn("prompt-scrollbar absolute top-0 inset-x-0 z-[1] w-full resize-none bg-transparent pl-4 pr-12 py-3.5 text-sm leading-[22px] text-foreground outline-none placeholder:font-medium placeholder:text-muted-foreground/80 cursor-text", expanded ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1 pointer-events-none", isScrolling ? "overflow-y-auto" : "overflow-y-hidden", isRecording && "pointer-events-none")}
          />

          <div ref={topFadeRef} className="absolute left-4 right-12 top-0 z-[2] h-8 bg-gradient-to-b from-card via-card/90 to-transparent pointer-events-none" />
          <div ref={bottomFadeRef} className="absolute left-4 right-12 z-[2] h-8 bg-gradient-to-t from-card via-card/90 to-transparent pointer-events-none" style={{ opacity: 0, top: `${textareaHeight - 32}px`, transition: isSmoothResize ? "top 0.15s ease-out" : "top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }} />

          <button type="button" onClick={expand} style={{ transition: isSmoothResize ? "none" : "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }} className={cn("absolute inset-x-0 top-0 z-[1] cursor-text pl-4 pr-12 py-[15px] text-left text-sm font-medium leading-[17px] text-muted-foreground/80 outline-none", !expanded ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-105 translate-y-1 pointer-events-none")} aria-label="Open prompt input">
            {placeholder}
          </button>

          <div className={cn("absolute bottom-2 left-3 right-12 z-[10] flex items-center gap-0 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]", expanded && !isRecording ? "opacity-100 blur-0 translate-y-0 pointer-events-auto" : "opacity-0 blur-sm translate-y-2 pointer-events-none")}>
            <div className="relative">
                          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); setIsModelSelectOpen((prev) => !prev); }} className={cn("group flex items-center gap-1 rounded-full px-2 py-1 text-foreground/50 transition-all duration-200 outline-none hover:bg-accent/60 hover:text-foreground cursor-default", isModelSelectOpen ? "bg-accent/60 text-foreground" : "")} aria-label={`Select model. Current: ${selectedModel?.name || 'Loading'}`}>
                {selectedModel?.thumbnail ? (
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-zinc-800 border border-white/10 relative -ml-0.5">
                    <img src={`${import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || `http://${window.location.hostname}:3000`}${selectedModel.thumbnail}`} className="size-4 rounded-full object-cover" alt={selectedModel.name} />
                  </div>
                ) : (
                  <ModelIcon model={selectedModel?.name || ''} className="size-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                )}
                <span className="text-xs font-semibold select-none transition-colors"><MorphingText text={selectedModel?.name || 'Select Model'} /></span>
              </button>
              
              <div style={{ transformOrigin: "bottom left" }} onMouseLeave={() => setHoverStyle((prev) => ({ ...prev, opacity: 0, transform: prev.transform.replace("scale(1)", "scale(0.95)"), transition: "opacity 0.2s ease-in, transform 0.2s ease-out" }))} className={cn("absolute bottom-full left-0 mb-2.5 z-50 w-44 rounded-2xl border border-border bg-card/95 p-1 shadow-xl backdrop-blur-md flex flex-col gap-0.5 transition-all duration-400 cursor-default overflow-hidden", isModelSelectOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto ease-[cubic-bezier(0.34,1.56,0.64,1)]" : "opacity-0 scale-95 translate-y-3 pointer-events-none ease-[cubic-bezier(0.175,0.885,0.32,1.275)]")}>

                <div className="flex items-center gap-2 w-full mb-1">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateAgent?.();
                      setIsModelSelectOpen(false);
                    }}
                    className="group shrink flex h-8 flex-1 items-center gap-2 rounded-xl border border-border/60 bg-accent/20 px-2.5 py-1.5 text-left text-xs font-semibold text-foreground transition-all duration-200 hover:bg-accent/40 hover:border-border active:scale-[0.98]"
                  >
                    <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
                      +
                    </span>
                    <span>Create Agent</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onManageAgents?.();
                      setIsModelSelectOpen(false);
                    }}
                    className="shrink-0 flex size-8 items-center justify-center rounded-xl border border-border/60 bg-accent/20 text-foreground/70 transition-all duration-200 hover:bg-accent/40 hover:text-foreground hover:border-border active:scale-[0.98]"
                    aria-label="Manage Agents"
                  >
                    <SettingsIcon />
                  </button>
                </div>

                <div className="my-1 h-px bg-border shrink-0" />

                <div className="relative flex flex-col gap-0.5 max-h-[220px] overflow-y-auto prompt-scrollbar pr-1 -mr-1">
                  {/*__________________ hover div ______________ */}
                  <div
                    className="absolute left-0 right-1 pointer-events-none transition-all z-0"
                    style={{
                      background: hoverStyle.opacity > 0 ? "rgba(255, 255, 255, 0.05)" : "transparent",
                      transform: hoverStyle.transform,
                      opacity: hoverStyle.opacity,
                      transition: hoverStyle.transition,
                      height: hoverStyle.height ?? 32,
                      borderRadius: "10px",
                    }}
                  />

                  <div className="relative z-10 flex flex-col gap-0.5">
                    <div className="px-2 py-1.5 text-[10px] font-semibold text-foreground/40 uppercase tracking-wider select-none">Base Model</div>

                    {models.map((model, idx) => (
                      <button
                        key={model._id? model._id: model}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={(e) => {
                          const target = e.currentTarget;
                          const parent = target.parentElement;
                          if (!parent) return;
                          const targetRect = target.getBoundingClientRect();
                          const parentRect = parent.getBoundingClientRect();
                          setHoverStyle({
                            transform: `translateY(${targetRect.top - parentRect.top}px) scale(1)`,
                            height: target.offsetHeight,
                            opacity: 1,
                            transition: "opacity 0.15s ease-out, transform 0.15s cubic-bezier(0.175,0.885,0.32,1.275)",
                          });
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModel(model);
                          setIsModelSelectOpen(false);
                          setHoverStyle((prev) => ({ ...prev, opacity: 0 }));
                          if (textareaRef.current) textareaRef.current.focus();
                        }}
                        className={cn("relative flex items-center justify-between w-full rounded-lg px-2 py-2 text-xs font-medium transition-colors outline-none cursor-default", selectedModel === model ? "text-primary bg-primary/10" : "text-foreground/70 hover:text-foreground")}
                      >
                        <span className="flex items-center gap-2 overflow-hidden w-full">
                          {model.thumbnail ? (
                            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-zinc-800/50 border border-white/5">
                              <img src={`${import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || `http://${window.location.hostname}:3000`}${model.thumbnail}`} className="size-4 rounded-full object-cover shrink-0" alt={model.name} />
                            </div>
                          ) : (
                            <ModelIcon
                              model={model.name? model.name: model}
                              className="size-3.5 opacity-85 shrink-0 group-hover:opacity-100 transition-opacity"
                            />
                          )}
                          <span className="truncate text-left w-full">{model.name?model.name:model}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={cycleEffort} className="group flex items-center gap-1 rounded-full px-2 py-1 text-foreground/50 transition-all duration-200 hover:bg-accent/60 hover:text-foreground outline-none cursor-default">
              <DynamicBarsIcon level={efforts[effortIndex]} />
              <span className="text-xs font-semibold select-none transition-colors"><MorphingText text={efforts[effortIndex]} /></span>
            </button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={openFileChooser} disabled={attachments.length >= maxAttachments} className="ml-auto flex size-7 items-center justify-center rounded-full text-foreground/50 transition-all duration-200 hover:bg-accent/60 hover:text-foreground outline-none cursor-default disabled:opacity-40 disabled:pointer-events-none">
              <PlusIcon />
            </button>
          </div>

          <div className={cn("absolute right-12 bottom-2 z-[10] flex h-8 items-center justify-end gap-[3px] transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]", isRecording ? "w-16 opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-4 pointer-events-none")}>
            {audioData.map((val, i) => (<div key={i} className="w-1 rounded-full bg-primary transition-[height] duration-75 ease-out" style={{ height: `${Math.max(4, val * 24)}px` }} />))}
          </div>

          <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} onClick={onActionButtonClick} aria-label={showArrow ? "Send prompt" : showStop ? "Stop recording" : "Use voice input"} style={{ borderRadius: 9999 }} className="absolute right-2 bottom-2 z-[10] flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground transition-all duration-300 hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-default">
            <span className="relative flex h-full w-full items-center justify-center">
              <span className={cn("absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]", showArrow ? "opacity-100 scale-100 rotate-0  blur-none" : "opacity-100 scale-100 rotate-0   pointer-events-none")}><ArrowUpIcon /></span>
              {/* <span className={cn("absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]", showMic ? "opacity-100 scale-100 rotate-0 blur-none" : "opacity-0 scale-50 -rotate-45 blur-[1px] pointer-events-none")}><MicIcon /></span> */}
              {/* <span className={cn("absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]", showStop ? "opacity-100 scale-100 rotate-0 blur-none" : "opacity-0 scale-50 rotate-45 blur-[1px] pointer-events-none")}><StopIcon /></span> */}
            </span>
          </button>
        </div>
      </div>

      {activeAttachment && (
        <AttachmentGalleryModal attachment={activeAttachment.attachment} originRect={activeAttachment.rect} onClose={() => setActiveAttachment(null)} />
      )}
    </>
  );

});

function AttachmentGalleryModal({ attachment, originRect, onClose }) {
  const [phase, setPhase] = useState("opening");
  const [targetRect, setTargetRect] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const maxW = Math.min(window.innerWidth * 0.86, 560);
    const maxH = Math.min(window.innerHeight * 0.78, 720);
    const naturalW = attachment.width || 800;
    const naturalH = attachment.height || 600;
    const scale = Math.min(maxW / naturalW, maxH / naturalH, 1.6);
    const width = naturalW * scale;
    const height = naturalH * scale;
    setTargetRect({ top: (window.innerHeight - height) / 2, left: (window.innerWidth - width) / 2, width, height, radius: 20 });
    const raf = requestAnimationFrame(() => setPhase("open"));
    return () => cancelAnimationFrame(raf);
  }, [attachment]);

  const handleClose = useCallback(() => setPhase("closing"), []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleClose]);

  const isOpen = phase === "open";
  const isClosing = phase === "closing";
  const geometry = isOpen && targetRect ? targetRect : { top: originRect.top, left: originRect.left, width: originRect.width, height: originRect.height, radius: 12 };
  const animEasing = isClosing ? "ease-out" : "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
  const animDur = isClosing ? "0.3s" : "0.45s";
  const flipTransition = `top ${animDur} ${animEasing}, left ${animDur} ${animEasing}, width ${animDur} ${animEasing}, height ${animDur} ${animEasing}, border-radius ${animDur} ${animEasing}`;

  return (
    <div className="fixed inset-0 z-[100]" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-md transition-opacity duration-400" style={{ opacity: isOpen ? 1 : 0 }} />
      <div
        style={{ position: "fixed", top: geometry.top, left: geometry.left, width: geometry.width, height: geometry.height, borderRadius: geometry.radius, transition: flipTransition, overflow: "hidden", boxShadow: isOpen ? "0 24px 60px -12px rgb(0 0 0 / 0.35)" : "0 0px 0px 0px rgb(0 0 0 / 0)" }}
        className="bg-muted"
        onTransitionEnd={() => { if (phase === "closing") onClose(); }}
        onClick={(e) => e.stopPropagation()}
      >
        <img ref={imgRef} src={attachment.url} alt={attachment.name} className="size-full object-cover" draggable={false} />
      </div>
      <button
        type="button" onClick={handleClose}
        style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? "scale(1)" : "scale(0.7)" }}
        className={cn("fixed right-4 top-4 flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground/70 shadow-md backdrop-blur-sm", "transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:bg-card hover:text-foreground", !isOpen && "pointer-events-none")}
      >
        <span className="scale-150"><CloseIcon /></span>
      </button>
    </div>
  );
}


function MorphingText({ text }) {
  const [width, setWidth] = useState("auto");
  const spanRef = useRef(null);
  useEffect(() => { if (spanRef.current) setWidth(spanRef.current.offsetWidth); }, [text]);
  return (
    <span className="relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]" style={{ width }}>
      <span ref={spanRef} className="invisible whitespace-nowrap px-1">{text}</span>
      <span key={text} className="absolute inset-0 flex items-center justify-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-300">{text}</span>
    </span>
  );
}

function ModelIcon({ model, className }) {
  const icons = {
    "Composer 2.5": "https://res.cloudinary.com/drhx7imeb/image/upload/v1781695268/cursor-ai-code-icon_j4vnux.svg",
    "Gemini 3.5 Flash": "https://res.cloudinary.com/drhx7imeb/image/upload/v1781695268/google-gemini-icon_l6kk5q.svg",
    "GPT 5.5": "https://res.cloudinary.com/drhx7imeb/image/upload/v1781695269/openai-icon_zozuib.svg",
    "Opus 4.8": "https://res.cloudinary.com/drhx7imeb/image/upload/v1781695268/Claude_AI_symbol_yqfzlc.svg",
    "GLM 5.2": "https://res.cloudinary.com/drhx7imeb/image/upload/v1781695269/z-ai-icon_xi4xvo.svg",
  };
  const filters = { "GPT 5.5": "dark:invert" };
  return <img src={icons[model] || icons["GPT 5.5"]} alt={model} className={cn("object-contain", filters[model], className)} />;
}

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="5" y="1" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.75 6.5V7a4.25 4.25 0 0 0 8.5 0v-.5M7 11.25V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DynamicBarsIcon({ level }) {
  const isMediumOrHigh = level === "Medium" || level === "Max Effort";
  const isHigh = level === "Max Effort";
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1.5" y="8" width="2.5" height="4.5" rx="1" fill="currentColor" className="transition-opacity duration-300" opacity={1} />
      <rect x="5.75" y="5" width="2.5" height="7.5" rx="1" fill="currentColor" className="transition-opacity duration-300" opacity={isMediumOrHigh ? 1 : 0.3} />
      <rect x="10" y="2" width="2.5" height="10.5" rx="1" fill="currentColor" className="transition-opacity duration-300" opacity={isHigh ? 1 : 0.3} />
    </svg>
  );
}

function AttachmentThumb({ attachment, index, onRemove, onOpen, registerRef }) {
  const [isHovered, setIsHovered] = useState(false);
  const btnRef = useRef(null);
  return (
    <button
      ref={(el) => { btnRef.current = el; registerRef(attachment.id, el); }}
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => { e.stopPropagation(); if (btnRef.current) onOpen(attachment, btnRef.current.getBoundingClientRect()); }}
      style={{ animationDelay: `${index * 35}ms`, animationFillMode: "backwards" }}
      className={cn("group relative size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted outline-none", "transition-transform duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-[1.04] active:scale-[0.96]", "animate-in fade-in slide-in-from-top-3 zoom-in-90 duration-400")}
      aria-label={`Open preview of ${attachment.name}`}
    >
      <img src={attachment.url} alt={attachment.name} className="size-full object-cover" draggable={false} />
      <span className={cn("absolute inset-0 flex items-start justify-end bg-black/0 transition-colors duration-200", isHovered && "bg-black/25")}>
        <span
          role="button" tabIndex={-1}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onClick={(e) => { e.stopPropagation(); onRemove(attachment.id); }}
          className={cn("m-1 flex size-4 items-center justify-center rounded-full bg-background/90 text-foreground/70 shadow-sm transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:bg-background hover:text-foreground hover:scale-110", isHovered ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none")}
          aria-label={`Remove ${attachment.name}`}
        >
          <CloseIcon />
        </span>
      </span>
    </button>
  );
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}



PromptInput.displayName = "PromptInput";
