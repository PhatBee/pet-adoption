// store/slices/adminStatsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { isAxiosError } from "axios";
import axiosClient from "../api/axiosClient";

interface RevenueData {
  label: string;
  revenue: number;
}

interface FetchRevenueParams {
  view?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

interface StatsState {
  revenueData: RevenueData[];
  loading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  revenueData: [],
  loading: false,
  error: null,
};

export const fetchRevenue = createAsyncThunk<
  RevenueData[],
  FetchRevenueParams,
  { rejectValue: string }
>(
  "stats/fetchRevenue",
  async (params, { rejectWithValue }) => {
    const { view = "month", startDate, endDate } = params;
    const queryParams = new URLSearchParams();

    if (view) queryParams.append("view", view);
    if (startDate) queryParams.append("startDate", startDate.toISOString());
    if (endDate) queryParams.append("endDate", endDate.toISOString());

    const url = `/admin/stats/revenue?${queryParams.toString()}`;
    try {
      const res = await axiosClient.get(url);
      return res.data;
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || err.message);
      }
      return rejectWithValue("Một lỗi không xác định đã xảy ra");
    }
  }
);

const statsSlice = createSlice({
  name: "stats",
  initialState,
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
        state.error = action.payload ?? "Lỗi không xác định";
      });
  },
});

export default statsSlice.reducer;
