import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Check for admin routes
    if (config.url?.startsWith("/admin")) {
      const adminToken = localStorage.getItem("adminToken");
      if (adminToken) {
        config.headers["Authorization"] = `Bearer ${adminToken}`;
      }
    } else {
      // For regular user routes
      const userToken = localStorage.getItem("accessToken");
      if (userToken) {
        config.headers["Authorization"] = `Bearer ${userToken}`;
      }
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;

      // Handle token expiration
      if (status === 401 && data.code === "TOKEN_EXPIRED") {
        console.log("Session expired. Redirecting to login...");
        // Clear the expired token
        localStorage.removeItem("accessToken");
        localStorage.removeItem("adminToken");

        // Redirect to login (you can use different approach based on your routing)
        if (window.location.pathname !== "/login") {
          window.location.href = "/login?expired=true";
        }
      }

      // Add more detailed logging for debugging
      const isDevelopment =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      if (isDevelopment) {
        console.error("Response error data:", error.response.data);
        console.error("Response error status:", error.response.status);
        console.error("Response error headers:", error.response.headers);
        console.error("Failed request URL:", error.config.url);
        console.error("Failed request method:", error.config.method);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message);
    }

    // Pass the error to the calling component
    return Promise.reject(error);
  }
);

export default axiosInstance;
