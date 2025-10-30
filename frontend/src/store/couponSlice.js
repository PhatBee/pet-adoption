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

// 1. Thêm Thunk mới để lưu coupon
export const saveCouponThunk = createAsyncThunk(
  "coupons/save",
  async (couponId, { rejectWithValue }) => {
    try {
      await couponApi.saveCoupon(couponId);
      return couponId; // Trả về couponId đã lưu thành công
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi lưu mã");
    }
  }
);

const initialState = {
  coupons: [],
  isLoading: false,
  error: null,
  isSaving: false
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
      })

      // 3. Thêm case cho saveCouponThunk
      .addCase(saveCouponThunk.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(saveCouponThunk.fulfilled, (state, action) => {
        state.isSaving = false;
        // Cập nhật mảng coupons: tìm couponId vừa lưu và set isSaved = true
        const savedCouponId = action.payload;
        const couponIndex = state.coupons.findIndex(c => c._id === savedCouponId);
        if (couponIndex !== -1) {
          state.coupons[couponIndex].isSaved = true;
        }
      })
      .addCase(saveCouponThunk.rejected, (state, action) => {
        state.isSaving = false;
        // Lỗi (như "đã lưu rồi") có thể được xử lý bằng toast ở component
        state.error = action.payload;
      });
    },
});

export const selectActiveCoupons = (state) => state.coupons.coupons;
export const selectCouponIsLoading = (state) => state.coupons.isLoading;
export const selectCouponIsSaving = (state) => state.coupons.isSaving; // 4. Export selector mới

export default couponSlice.reducer;