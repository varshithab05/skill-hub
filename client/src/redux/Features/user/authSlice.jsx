import { createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

// Initialize state with token, role, and username from localStorage
const initialState = {
  accessToken: localStorage.getItem("accessToken") || null,
  role: localStorage.getItem("role") || null,
  username: localStorage.getItem("username") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem("accessToken", action.payload);
    },
    setRole: (state, action) => {
      state.role = action.payload;
      localStorage.setItem("role", action.payload);
    },
    setUsername: (state, action) => {
      state.username = action.payload;
      localStorage.setItem("username", action.payload);
    },
    logout: (state) => {
      state.accessToken = null;
      state.role = null;
      state.username = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
    },
  },
});

// Async thunk for signup
export const signup = (userInfo, password, role) => async (dispatch) => {
  try {
    const response = await axiosInstance.post("/user/register", {
      ...userInfo,
      password,
      role,
    });

    if (response.data.success) {
      const accessToken = response.data.token;
      const username = response.data.username; // Assuming username is returned in response
      dispatch(setAccessToken(accessToken)); // Dispatch access token
      dispatch(setRole(role)); // Dispatch role
      dispatch(setUsername(username)); // Dispatch username
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error registering user");
  }
};

// Async thunk for login
export const login = (usernameOrEmail, password) => async (dispatch) => {
  try {
    const response = await axiosInstance.post("/user/login", {
      usernameOrEmail,
      password,
    });

    if (response.data.success) {
      const accessToken = response.data.token;
      const role = response.data.role;
      const username = response.data.username;

      // Store token and user data in localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("role", role);
      localStorage.setItem("username", username);

      // Also update Redux state
      dispatch(setAccessToken(accessToken));
      dispatch(setRole(role));
      dispatch(setUsername(username));

      return { success: true };
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);

    // Check for specific error types
    if (error.response) {
      // Server returned an error
      const errorMessage =
        error.response.data.message || "Authentication failed";
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response
      throw new Error(
        "No response from server. Please check your internet connection."
      );
    } else {
      // Something else went wrong
      throw new Error(error.message || "Error logging in");
    }
  }
};

// Selector to get accessToken from state
export const selectAccessToken = (state) => state.auth?.accessToken;

// Selector to get role from state
export const selectRole = (state) => state.auth?.role;

// Selector to get username from state
export const selectUsername = (state) => state.auth?.username;

// Export the actions created automatically by the slice
export const { setAccessToken, setRole, setUsername, logout } =
  authSlice.actions;

// Thunk action to handle logout and navigation
export const logoutAndNavigate = () => (dispatch) => {
  dispatch(logout());
  // Note: Navigation should be handled in the component using useNavigate hook
};

// Export the reducer to add it to the store
export default authSlice.reducer;
