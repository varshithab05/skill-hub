import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

// Thunk to fetch wallet balance
export const fetchWalletBalance = createAsyncThunk(
  "earnings/fetchWalletBalance",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/wallet/balance");
      return response.data.walletBalance; // Assuming the response structure is { balance: <number> }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk to fetch recent transactions summary
export const fetchEarningsSummary = createAsyncThunk(
  "earnings/fetchEarningsSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/transaction/earnings-summary");
      console.log(`DEBUG`, response.data.recentTransactions);
      return response.data.recentTransactions; // Assuming the response structure is { recentTransactions: [...] }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const earningsSlice = createSlice({
  name: "earnings",
  initialState: {
    wallet: 0,
    recentTransactions: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Wallet Balance
      .addCase(fetchWalletBalance.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.wallet = action.payload;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Recent Transactions
      .addCase(fetchEarningsSummary.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEarningsSummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.recentTransactions = action.payload;
      })
      .addCase(fetchEarningsSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default earningsSlice.reducer;
