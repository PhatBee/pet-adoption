// src/store/statsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

// Thunk gọi API lấy doanh thu
export const fetchRevenue = createAsyncThunk(
  "stats/fetchRevenue",
  async (viewMode = "month", { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(`/admin/stats/revenue?view=${viewMode}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const statsSlice = createSlice({
  name: "stats",
  initialState: {
    revenueData: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenue.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueData = action.payload;
      })
      .addCase(fetchRevenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default statsSlice.reducer;
