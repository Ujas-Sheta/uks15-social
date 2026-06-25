import axios from 'axios'

export const makeRequest = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8800/api",
    withCredentials: true,
})


makeRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data;
    const isStaleSession =
      error.response?.status === 401 &&
      typeof message === "string" &&
      (message.includes("log in") || message.includes("Session user"));

    if (isStaleSession) {
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
