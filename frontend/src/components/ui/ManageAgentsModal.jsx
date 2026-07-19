import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { X, Trash2, Edit2, Sparkles, Bot, Check, Save } from 'lucide-react';
import { axiosInstance as axios } from '../../api/axios.jsx';
import { setAgents } from '../../redux/reducers/agentSlice';
import { editAgent, getAgentConfig } from '../../redux/actions/agentAction';

const EASE_OUT = 'cubic-bezier(0,0,0.2,1)';

export default function ManageAgentsModal({ open, onClose }) {
  const dispatch = useDispatch();
  const agents = useSelector(state => state.agent.agents);
  const agentConfigList = useSelector(state => state.agent.agentConfig);
  const [loadingId, setLoadingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', systemPrompt: '', thumbnail: '', model: '', tools: [] });

  const config = agentConfigList?.[0] || null;

  useEffect(() => {
    if (open && (!agentConfigList || agentConfigList.length === 0)) {
      dispatch(getAgentConfig());
    }
  }, [open, agentConfigList, dispatch]);

  const handleDelete = async (agent) => {
    if (agent.isBuiltIn) return;
    if (!window.confirm(`Are you sure you want to delete ${agent.name}?`)) return;
    
    setLoadingId(agent._id);
    try {
      await axios.delete(`/agents/delete/${agent._id}`);
      const updatedAgents = agents.filter(a => a._id !== agent._id);
      dispatch(setAgents(updatedAgents));
    } catch (error) {
      console.error("Failed to delete agent:", error);
      alert("Failed to delete agent.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleEditClick = (agent) => {
    setEditingId(agent._id);
    setEditForm({
      name: agent.name,
      description: agent.description || '',
      systemPrompt: agent.settings?.systemPrompt || '',
      thumbnail: '',
      model: agent.settings?.model || '',
      tools: agent.tools || [] 
    });
  };

  const handleEditSubmit = async (agent) => {
    setLoadingId(agent._id);
    try {
      const payload = new FormData();
      payload.append('name', editForm.name);
      payload.append('description', editForm.description);
      if (editForm.thumbnail) {
        payload.append('thumbnail', editForm.thumbnail);
      }
      
      const newSettings = { ...(agent.settings || {}), systemPrompt: editForm.systemPrompt, model: editForm.model };
      payload.append('settings', JSON.stringify(newSettings));
      payload.append('tools', JSON.stringify(editForm.tools));

      await dispatch(editAgent(agent._id, payload));
      setEditingId(null);
    } catch (error) {
      console.error("Failed to edit agent:", error);
      alert("Failed to edit agent.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center transition-opacity px-4",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      style={{ transitionDuration: '400ms', transitionTimingFunction: EASE_OUT }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => { if(!loadingId) onClose(); }}
      />

      {/* Modal Container */}
      <div
        className={cn(
          "relative w-full max-w-lg shadow-2xl transition-all flex flex-col overflow-hidden",
          "max-h-[85vh] rounded-2xl bg-[#0a1118] border border-white/10",
          open ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        )}
        style={{
          transitionDuration: '350ms',
          transitionTimingFunction: EASE_OUT,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06] bg-[#0a1118] shrink-0">
          <h2 className="text-[14px] font-medium text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded-[6px] bg-white/[0.05] flex items-center justify-center border border-white/[0.08]">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            Manage Agents
          </h2>
          <button
            onClick={() => { if(!loadingId) onClose(); }}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] hover:bg-white/10 text-white/50 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Agents */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-white/10">
          {agents && agents.length > 0 ? (
            agents.map((agent) => (
              <div 
                key={agent._id} 
                className={cn(
                  "flex flex-col p-3 rounded-xl border transition-all",
                  editingId === agent._id ? "bg-white/[0.05] border-white/[0.15]" : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]"
                )}
              >
                {/* View Mode */}
                {editingId !== agent._id && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {agent.thumbnail ? (
                        <img 
                          src={`${import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || `http://${window.location.hostname}:3000`}${agent.thumbnail}`} 
                          className="w-8 h-8 rounded-full object-cover shrink-0 bg-white/10" 
                          alt={agent.name} 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4 text-white/60" />
                        </div>
                      )}
                      <div className="flex flex-col truncate">
                        <span className="text-[13px] font-medium text-white/90 truncate">{agent.name}</span>
                        <span className="text-[11px] text-white/40 truncate">{agent.description || 'Custom Agent'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      {!agent.isBuiltIn && (
                        <>
                          <button 
                            onClick={() => handleEditClick(agent)}
                            className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all"
                            title="Edit Agent"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(agent)}
                            disabled={loadingId === agent._id}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all disabled:opacity-50"
                            title="Delete Agent"
                          >
                            {loadingId === agent._id ? (
                              <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </>
                      )}
                      {agent.isBuiltIn && (
                        <span className="text-[10px] uppercase font-semibold text-white/30 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                          Built-in
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Edit Mode */}
                {editingId === agent._id && (
                  <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-white/50 uppercase font-semibold tracking-wider">Agent Name</label>
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-white/50 uppercase font-semibold tracking-wider">Description</label>
                      <input 
                        type="text" 
                        value={editForm.description} 
                        onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-white/50 uppercase font-semibold tracking-wider">System Prompt</label>
                      <textarea 
                        value={editForm.systemPrompt} 
                        onChange={e => setEditForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                        rows={3}
                        className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-white/30 transition-colors resize-none scrollbar-thin scrollbar-thumb-white/10"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-white/50 uppercase font-semibold tracking-wider">Base Model</label>
                      <select
                        value={editForm.model}
                        onChange={e => setEditForm(prev => ({ ...prev, model: e.target.value }))}
                        className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-white/30 transition-colors cursor-pointer appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.75rem center',
                          backgroundSize: '1em'
                        }}
                      >
                        <option value="" disabled className="bg-[#0a1118] text-white/50">Select a base model...</option>
                        {(config?.models || []).map(m => (
                          <option key={m.modelId} value={m.modelId} className="bg-[#0a1118] text-white">
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-white/50 uppercase font-semibold tracking-wider">Tools</label>
                      
                      {/* Select All / Deselect All */}
                      {(() => {
                        const allNames = (config?.tools || []).map(t => t.name);
                        const allChosen = allNames.length > 0 && allNames.every(n => editForm.tools.includes(n));
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
                          <>
                            <div className="flex items-center justify-between px-0.5 mb-1">
                              <span className="text-[10px] text-white/30">{editForm.tools.length} of {allNames.length} selected</span>
                              <button
                                onClick={() => setEditForm(prev => ({ ...prev, tools: allChosen ? [] : allNames }))}
                                className="text-[10px] font-semibold text-white/50 hover:text-white transition-colors px-2 py-0.5 rounded hover:bg-white/10"
                              >
                                {allChosen ? 'Deselect All' : 'Select All'}
                              </button>
                            </div>
                            <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-white/10">
                              {(config?.tools || []).map((tool, idx) => {
                                const isSelected = editForm.tools.includes(tool.name);
                                const color = toolColors[idx % toolColors.length];
                                return (
                                  <div
                                    key={tool.name}
                                    onClick={() => {
                                      setEditForm(prev => ({
                                        ...prev,
                                        tools: isSelected
                                          ? prev.tools.filter(t => t !== tool.name)
                                          : [...prev.tools, tool.name]
                                      }));
                                    }}
                                    className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                                    style={{
                                      background: isSelected ? color.glow : 'rgba(255,255,255,0.03)',
                                      border: `1px solid ${isSelected ? color.accent + '60' : 'rgba(255,255,255,0.06)'}`,
                                      borderLeft: `3px solid ${color.accent}`,
                                    }}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="text-[12px] font-semibold text-white truncate">{tool.name}</div>
                                      <div className="text-[10px] text-white/40 truncate mt-0.5">
                                        {tool.description?.substring(0, 60)}...
                                      </div>
                                    </div>
                                    <div
                                      className="w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 transition-all"
                                      style={{ background: isSelected ? color.accent : 'rgba(255,255,255,0.08)' }}
                                    >
                                      {isSelected && <Check className="w-3 h-3 stroke-[3] text-black" />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-white/50 uppercase font-semibold tracking-wider">Update Thumbnail (Optional)</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => {
                          if(e.target.files && e.target.files[0]) {
                            setEditForm(prev => ({ ...prev, thumbnail: e.target.files[0] }));
                          }
                        }}
                        className="bg-black/20 border border-white/10 rounded-lg p-2 text-[12px] text-white/70 outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-white/10">
                      <button 
                        onClick={() => setEditingId(null)}
                        disabled={loadingId === agent._id}
                        className="px-4 py-1.5 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-all text-[12px] font-medium disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleEditSubmit(agent)}
                        disabled={loadingId === agent._id || !editForm.name.trim()}
                        className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-white/90 transition-all text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {loadingId === agent._id ? (
                          <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-white/40 text-[13px] py-6">
              No agents found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
