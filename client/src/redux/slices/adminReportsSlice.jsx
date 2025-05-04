import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchReports = createAsyncThunk(
  'adminReports/fetchReports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/admin/reports');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const adminReportsSlice = createSlice({
  name: 'adminReports',
  initialState: {
    statistics: null,
    recentActivities: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload.statistics;
        state.recentActivities = action.payload.recentActivities;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch reports';
      });
  },
});

export default adminReportsSlice.reducer;
