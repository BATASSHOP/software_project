import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Initial state
const initialState = {
  isAuthenticated: !!localStorage.getItem("authToken"),
  isLoading: false,
  user: JSON.parse(localStorage.getItem("user")) || null,
  error: null,
  resetPasswordStatus: null,
  resetPasswordError: null,
};

// Register User
export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, formData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An unexpected error occurred" });
    }
  }
);

// Login User
export const loginUser = createAsyncThunk(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData, {
        withCredentials: true,
      });
      if (response.data.success) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An unexpected error occurred" });
    }
  }
);

// Logout User
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An unexpected error occurred" });
    }
  }
);

// Check Authentication
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/check-auth`, {
        withCredentials: true,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An unexpected error occurred" });
    }
  }
);

// Verify User
export const verifyUser = createAsyncThunk(
  "auth/verify",
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify`, { email, code }, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An unexpected error occurred" });
    }
  }
);

// Request Password Reset
export const requestPasswordReset = createAsyncThunk(
  "auth/request-reset",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/request-reset`, { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An unexpected error occurred" });
    }
  }
);

// Reset Password
export const resetPassword = createAsyncThunk(
  "auth/reset-password/:token",
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password/${token}`, { newPassword });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An unexpected error occurred" });
    }
  }
);

// Auth Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Registration failed";
      })

      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || "Login failed";
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })

      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : JSON.parse(localStorage.getItem("user"));
        state.isAuthenticated = action.payload.success || !!localStorage.getItem("authToken");
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Authentication check failed";
      })

      .addCase(verifyUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Verification failed";
      })

      .addCase(requestPasswordReset.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resetPasswordStatus = action.payload.success ? "Request Successful" : "Request Failed";
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.isLoading = false;
        state.resetPasswordStatus = "Request Failed";
        state.resetPasswordError = action.payload;
      })

      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resetPasswordStatus = action.payload.success ? "Password Reset Successful" : "Password Reset Failed";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.resetPasswordStatus = "Password Reset Failed";
        state.resetPasswordError = action.payload;
      });
  },
});

// Export actions and reducer
export const { setUser } = authSlice.actions;
export default authSlice.reducer;
