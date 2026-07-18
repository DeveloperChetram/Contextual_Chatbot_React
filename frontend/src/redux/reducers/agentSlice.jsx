import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  agents: [],
  agentConfig: null,
  loading: false,
  error: null,
  agentChatData :[],
  agentStatus: "" // Real-time operation status
};

const agentSlice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setAgents: (state, action) => {
      state.agents = action.payload;
    },
    addAgent: (state, action) => {
      state.agents.push(action.payload);
    },
    setAgentConfig: (state, action) => {
      state.agentConfig = action.payload;
    },
    addAgentChatData: (state, action) => {
      state.agentChatData.push(action.payload);
    },
    setAgentStatus: (state, action) => {
      state.agentStatus = action.payload;
    },
    updateAgent: (state, action) => {
      const index = state.agents.findIndex(a => a._id === action.payload._id);
      if (index !== -1) {
        state.agents[index] = action.payload;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setAgents,
  addAgent,
  setAgentConfig,
  addAgentChatData,
  setAgentStatus,
  updateAgent,
} = agentSlice.actions;

export default agentSlice.reducer;
