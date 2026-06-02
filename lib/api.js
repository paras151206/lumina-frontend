import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7860";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 60000,  // 60s — LLM calls can be slow
});

// ── Session ID helpers ───────────────────────────────────────────────────────
export const getSessionId = () =>
  typeof window !== "undefined" ? localStorage.getItem("study_session_id") : null;

export const setSessionId = (id) =>
  typeof window !== "undefined" && localStorage.setItem("study_session_id", id);

export const clearSession = () =>
  typeof window !== "undefined" && localStorage.removeItem("study_session_id");

// ── API calls ────────────────────────────────────────────────────────────────
export const uploadFile = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post("/upload/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const findAnswer = async (question) => {
  const res = await api.post("/answer/", {
    session_id: getSessionId(),
    question,
  });
  return res.data;
};

export const learnTopic = async (topic, depth = "normal") => {
  const res = await api.post("/learn/", {
    session_id: getSessionId(),
    topic,
    depth,
  });
  return res.data;
};

export const generateTest = async (topic = "", num_questions = 5, style = "mixed") => {
  const res = await api.post("/test/", {
    session_id: getSessionId(),
    topic,
    num_questions,
    style,
  });
  return res.data;
};

export const generateQuiz = async (num_questions = 5) => {
  const res = await api.post("/quiz/", {
    session_id: getSessionId(),
    num_questions,
  });
  return res.data;
};
