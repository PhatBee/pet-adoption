import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import couponApi from "../api/couponApi";

export const fetchActiveCoupons = createAsyncThunk(
  "coupons/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      const res = await couponApi.getActiveCoupons();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi tải khuyến mãi");
    }
  }
);

const initialState = {
  coupons: [],
  isLoading: false,
  error: null,
};

const couponSlice = createSlice({
  name: "coupons",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveCoupons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchActiveCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const selectActiveCoupons = (state) => state.coupons.coupons;
export const selectCouponIsLoading = (state) => state.coupons.isLoading;

export default couponSlice.reducer;