import axios from "axios";

const API_BASE = "http://localhost:8000/api/session";

export const startSession = async (customerId) => {
  const res = await axios.post(`${API_BASE}/start-session?customer_id=${customerId}`);
  return res.data;
};

export const getAssignedSessions = async (agentId) => {
  const res = await axios.get(`${API_BASE}/assigned/${agentId}`);
  return res.data; // now contains customer_name
};

export const getMessages = async (sessionId) => {
  const res = await axios.get(`${API_BASE}/messages/${sessionId}`);
  return res.data;
};

export const sendMessage = async (messagePayload) => {
  const res = await axios.post(`${API_BASE}/send`, messagePayload);
  return res.data;
};

export const endSession = async (sessionId, customerId) => {
  const res = await axios.post(
    `http://localhost:8000/api/session/end-session?session_id=${sessionId}&customer_id=${customerId}`
  );
  return res.data;
}
export const getAgentLogs = async (agentId) => {
  const res = await axios.get(`http://localhost:8000/api/logs/agent/${agentId}`);
  return res.data;
};