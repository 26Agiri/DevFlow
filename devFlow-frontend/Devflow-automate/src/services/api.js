import axios from "axios";

const api = axios.create({
  baseURL: "https://devflow-backend-9ie3.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const publicEndpoints = [
      "/auth/login",
      "/auth/register",
      "/users",
    ];

    if (publicEndpoints.includes(config.url)) {
      console.log("Public API request:", config.method, config.url);
      return config;
    }

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      console.log(
        "API request:",
        config.method,
        config.url,
        "JWT attached"
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(
      "API response:",
      response.status,
      response.config.url
    );

    return response;
  },
  (error) => {
    console.error(
      "API error:",
      error.response?.status,
      error.config?.url,
      error.response?.data
    );

    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;