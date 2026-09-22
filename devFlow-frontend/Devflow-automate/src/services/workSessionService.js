import api from "./api";

export const startWorkSession = async () => {
  const response = await api.post("/work-sessions/start");
  return response.data;
};

export const pauseWorkSession = async () => {
  const response = await api.post("/work-sessions/pause");
  return response.data;
};

export const resumeWorkSession = async () => {
  const response = await api.post("/work-sessions/resume");
  return response.data;
};

export const stopWorkSession = async () => {
  const response = await api.post("/work-sessions/stop");
  return response.data;
};

export const getWorkSessionStatus = async () => {
  const response = await api.get("/work-sessions/status");
  return response.data;
};

export const sendWorkSessionHeartbeat = async () => {
  const response = await api.post("/work-sessions/heartbeat");
  return response.data;
};