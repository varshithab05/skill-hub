import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  recentJobs: [
    {
      _id: "66f436640adb04612cb0c37f",
      title: "Frontend Development for E-commerce Website",
      description:
        "Develop frontend components for an e-commerce website using React and Redux.",
      budget: 1000,
      employer: "66f2a5f3b8add7538ab0b02e",
      status: "open",
      freelancer: null,
      bidAccepted: false,
    },
  ],
  job: null,
  bidAccepted: false,
};

export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/jobs", jobData); // Adjust API path as needed
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data); // Return error if the request fails
    }
  }
);

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setRecentJobs: (state, action) => {
      state.recentJobs = action.payload;
    },
    setJobById: (state, action) => {
      state.job = action.payload;
    },
    updateRecentJobs: (state, action) => {
      state.recentJobs = { ...state.recentJobs, ...action.recentJobs };
    },
    resetBidSuccess: (state) => {
      state.bidAccepted = false;
    },
    setBidSuccess: (state) => {
      state.bidAccepted = true;
    },
  },
});

export const {
  setRecentJobs,
  updateRecentJobs,
  setJobById,
  resetBidSuccess,
  setBidSuccess,
} = jobsSlice.actions;

export const selectRecentJobs = (state) => state.jobs.recentJobs;
export const selectJobById = (state) => state.jobs.job;

export default jobsSlice.reducer;
