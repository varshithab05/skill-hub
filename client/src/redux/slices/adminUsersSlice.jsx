import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance.jsx';

export const fetchUsers = createAsyncThunk(
  'adminUsers/fetchUsers',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { admin } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${admin.token}`,
        },
      };
      const response = await axiosInstance.get('/admin/users', config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch users');
    }
  }
);

export const updateUser = createAsyncThunk(
  'adminUsers/updateUser',
  async ({ userId, updates }, { rejectWithValue, getState }) => {
    try {
      const { admin } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${admin.token}`,
        },
      };
      const response = await axiosInstance.put(`/admin/users/${userId}`, updates, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'adminUsers/deleteUser',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const { admin } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${admin.token}`,
        },
      };
      await axiosInstance.delete(`/admin/users/${userId}`, config);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete user');
    }
  }
);

const adminUsersSlice = createSlice({
  name: 'adminUsers',
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error fetching users';
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user._id !== action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });
  },
});

export default adminUsersSlice.reducer;
