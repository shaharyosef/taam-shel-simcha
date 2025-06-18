import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// נתיבים ציבוריים שלא צריך להעיף את המשתמש מהם אם אין טוקן
const publicPaths = ["/guest", "/public", "/ai-recipe"];

// ✅ שלב 1 – הוספת Authorization Header אם יש טוקן
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

// ✅ שלב 2 – טיפול בשגיאה 401: הפניה ל־/login רק אם לא בדף ציבורי
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isGuestPage = publicPaths.some((prefix) =>
      window.location.pathname.startsWith(prefix)
    );

    if (error.response?.status === 401 && !isGuestPage) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;


export async function deleteComment(id: number) {
  return await api.delete(`/comments/${id}`);
}
