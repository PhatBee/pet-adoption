import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productApi from "../api/productApi";

export const fetchProductBySlug = createAsyncThunk(
  "products/fetchBySlug",
  async (slug) => {
    const res = await productApi.getBySlug(slug);
    // backend có thể trả { product: {...} } hoặc { data: ... }, điều chỉnh tuỳ backend
    return res.data.product || res.data;
  }
);

const slice = createSlice({
  name: "productDetail",
  initialState: {
    product: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearProduct: (state) => {
      state.product = null;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductBySlug.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchProductBySlug.fulfilled, (s, a) => { s.isLoading = false; s.product = a.payload; })
      .addCase(fetchProductBySlug.rejected, (s, a) => { s.isLoading = false; s.error = a.error?.message || "Lỗi" ; });
  }
});

export const { clearProduct } = slice.actions;
export default slice.reducer;
