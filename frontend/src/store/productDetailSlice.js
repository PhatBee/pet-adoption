import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productApi from "../api/productApi";

export const fetchProductBySlug = createAsyncThunk(
  "products/fetchBySlug",
  async (slug) => {
    const res = await productApi.getBySlug(slug);
    return res.data;
  }
);

const slice = createSlice({
  name: "productDetail",
  initialState: {
    product: null,
    reviews: [], // Thêm state để lưu danh sách reviews
    reviewStats: { average: 0, count: 0 }, // Thêm state cho thống kê
    isLoading: false,
    error: null,
  },
  reducers: {
    clearProduct: (state) => {
      // Dọn dẹp tất cả các state khi rời khỏi trang
      state.product = null;
      state.reviews = [];
      state.reviewStats = { average: 0, count: 0 };
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductBySlug.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchProductBySlug.fulfilled, (s, a) => { 
        s.isLoading = false; 
        s.product = a.payload.product;
        s.reviews = a.payload.reviews || [];
        s.reviewStats = a.payload.reviewStats || { average: 0, count: 0 };
        })
      .addCase(fetchProductBySlug.rejected, (s, a) => { s.isLoading = false; s.error = a.error?.message || "Lỗi" ; });
  }
});

export const { clearProduct } = slice.actions;
export default slice.reducer;
