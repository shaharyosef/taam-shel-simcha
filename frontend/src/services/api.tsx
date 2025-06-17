import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// שלב 1 – הוספת Authorization Header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// שלב 2 – טיפול בשגיאה 401: העפת המשתמש לדף התחברות
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // ודא שזה הנתיב שלך
    }
    return Promise.reject(error);
  }
);

export default api;


export async function deleteComment(id: number) {
  return await api.delete(`/comments/${id}`);
}
