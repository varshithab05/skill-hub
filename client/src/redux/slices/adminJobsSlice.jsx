import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchJobs = createAsyncThunk(
  'adminJobs/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/jobs');
      console.log(response.data.response)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteJob = createAsyncThunk(
  'adminJobs/deleteJob',
  async (jobId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/jobs/${jobId}`);
      return jobId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateJob = createAsyncThunk(
  'adminJobs/updateJob',
  async ({ jobId, updates }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/admin/jobs/${jobId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const adminJobsSlice = createSlice({
  name: 'adminJobs',
  initialState: {
    jobs: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error fetching jobs';
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter(job => job._id !== action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(job => job._id === action.payload._id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      });
  },
});

export default adminJobsSlice.reducer;
