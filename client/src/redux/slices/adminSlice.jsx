import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Get stored admin data
const getStoredAdminData = () => {
  try {
    const token = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("adminData");
    return {
      token,
      currentAdmin: adminData ? JSON.parse(adminData) : null,
      admins: [],
      loading: false,
      error: null,
      success: null,
    };
  } catch {
    return {
      token: null,
      currentAdmin: null,
      admins: [],
      loading: false,
      error: null,
      success: null,
    };
  }
};

const initialState = getStoredAdminData();

// Async thunks
export const loginAdmin = createAsyncThunk(
  "admin/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/login", credentials);
      const { token, admin } = response.data;

      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminData", JSON.stringify(admin));

      return { token, admin };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const getCurrentAdmin = createAsyncThunk(
  "admin/getCurrent",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/admin/current");
      localStorage.setItem("adminData", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      return rejectWithValue(
        error.response?.data?.message || "Failed to get current admin"
      );
    }
  }
);

export const fetchAllAdmins = createAsyncThunk(
  "admin/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/admin/all");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admins"
      );
    }
  }
);

export const createAdmin = createAsyncThunk(
  "admin/create",
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/create", adminData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create admin"
      );
    }
  }
);

export const updateAdmin = createAsyncThunk(
  "admin/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/admin/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update admin"
      );
    }
  }
);

export const deleteAdmin = createAsyncThunk(
  "admin/delete",
  async (adminId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/${adminId}`);
      return adminId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete admin"
      );
    }
  }
);

export const updatePermissions = createAsyncThunk(
  "admin/updatePermissions",
  async ({ id, permissions }, { rejectWithValue }) => {
    console.log(id, permissions);
    try {
      const response = await axiosInstance.patch(`/admin/${id}/permissions`, {
        permissions,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update permissions"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.currentAdmin = null;
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.currentAdmin = action.payload.admin;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Current Admin
      .addCase(getCurrentAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAdmin = action.payload;
      })
      .addCase(getCurrentAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentAdmin = null;
        state.token = null;
      })
      // Fetch All Admins
      .addCase(fetchAllAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload;
      })
      .addCase(fetchAllAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Admin
      .addCase(createAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.admin) {
          const adminWithId = {
            ...action.payload.admin,
            _id: action.payload.admin._id || action.payload.admin.id,
          };
          state.admins.push(adminWithId);
        } else if (action.payload) {
          const adminWithId = {
            ...action.payload,
            _id: action.payload._id || action.payload.id,
          };
          state.admins.push(adminWithId);
        }
        state.success = "Admin created successfully";
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Admin
      .addCase(updateAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.admins.findIndex(
          (admin) => admin._id === action.payload._id
        );
        if (index !== -1) {
          state.admins[index] = action.payload;
        }
        state.success = "Admin updated successfully";
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Permissions
      .addCase(updatePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Permissions updated successfully";
        state.admins = state.admins.map((admin) =>
          admin._id === action.payload._id ? action.payload : admin
        );
      })
      .addCase(updatePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Admin
      .addCase(deleteAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = state.admins.filter(
          (admin) => admin._id !== action.payload
        );
        state.success = "Admin deleted successfully";
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, clearSuccess, setError } =
  adminSlice.actions;
export default adminSlice.reducer;
