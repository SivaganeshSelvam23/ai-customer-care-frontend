import axios from "axios";

const API_BASE = "http://localhost:8000/api/session";

export const startSession = async (customerId) => {
  const res = await axios.post(`${API_BASE}/start-session?customer_id=${customerId}`);
  return res.data;
};

export const getAssignedSessions = async (agentId) => {
  const res = await axios.get(`${API_BASE}/assigned/${agentId}`);
  return res.data.sessions; // array of sessions
};

export const getMessages = async (sessionId) => {
  const res = await axios.get(`${API_BASE}/messages/${sessionId}`);
  return res.data;
};

export const sendMessage = async (messagePayload) => {
  const res = await axios.post(`${API_BASE}/send`, messagePayload);
  return res.data;
};
