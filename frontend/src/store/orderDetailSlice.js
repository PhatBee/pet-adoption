import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import orderApi from "../api/orderApi";
import { toast } from "react-toastify";

export const fetchOrderDetail = createAsyncThunk(
  "orderDetail/fetchOrderDetail",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await orderApi.getOrderDetail(orderId);
      return res.data; // { order, reviews }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi lấy chi tiết đơn");
    }
  }
);

export const submitReview = createAsyncThunk(
  "orderDetail/submitReview",
  async ({ orderId, productId, rating, comment }, { rejectWithValue }) => {
    try {
      const res = await orderApi.postReview(orderId, { productId, rating, comment });
      return res.data.review;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi gửi đánh giá");
    }
  }
);

const slice = createSlice({
  name: "orderDetail",
  initialState: { order: null, reviews: {}, isLoading: false, error: null },
  reducers: { clearOrder: (s) => { s.order = null; s.reviews = {}; s.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchOrderDetail.pending, (s) => { s.isLoading = true; s.error = null; })
     .addCase(fetchOrderDetail.fulfilled, (s, a) => { s.isLoading = false; s.order = a.payload.order; s.reviews = a.payload.reviews || {}; })
     .addCase(fetchOrderDetail.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; toast.error(a.payload); })

     .addCase(submitReview.pending, (s) => { /* optionally set flag */ })
     .addCase(submitReview.fulfilled, (s, a) => {
        // a is review doc — update reviews map
        const r = a.payload;
        s.reviews[r.product.toString()] = r;
        toast.success("Đã lưu đánh giá");
     })
     .addCase(submitReview.rejected, (s, a) => { toast.error(a.payload || "Lỗi khi gửi đánh giá"); });
  }
});

export const { clearOrder } = slice.actions;
export default slice.reducer;
