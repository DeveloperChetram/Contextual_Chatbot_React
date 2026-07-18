import { axiosInstance as axios } from '../../api/axios.jsx';
import { setAgents, addAgent, setAgentConfig, setLoading, setError, updateAgent } from '../reducers/agentSlice';

export const getAgentConfig = () => async (dispatch) => {
  try {
    const response = await axios.get('/agents/agentConfig');
    dispatch(setAgentConfig(response.data.data));
    return response.data;
  } catch (error) {
    console.error('Failed to get agent config:', error);
    throw error;
  }
};

export const createAgent = (agentData) => async (dispatch) => {
  try {
    const response = await axios.post('/agents/create', agentData);
    if (response.data?.success) {
      dispatch(addAgent(response.data.data));
    }
    return response.data;
  } catch (error) {
    console.error('Failed to create agent:', error);
    throw error;
  }
};

export const editAgent = (agentId, agentData) => async (dispatch) => {
  try {
    const response = await axios.put(`/agents/edit/${agentId}`, agentData);
    if (response.data?.success) {
      dispatch(updateAgent(response.data.data));
    }
    return response.data;
  } catch (error) {
    console.error('Failed to edit agent:', error);
    throw error;
  }
};

export const getAgents = () => async (dispatch) => {
  console.log('getAgents thunk initialized!');
  try {
    dispatch(setLoading(true));
    console.log('Sending GET request to /agents/agents...');
    const response = await axios.get('/agents/agents');
    console.log('response in action:', response.data);
    
    if (response.data?.success) {
      dispatch(setAgents(response.data.data));
    }
    return response.data;
  } catch (error) {
    console.error('Failed to get agents. Axios error:', error.response?.data || error.message);
    dispatch(setError(error.message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};


