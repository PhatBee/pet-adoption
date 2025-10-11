import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productApi from '../api/productApi';

// Thunk để gọi API lấy sản phẩm theo trang
export const fetchProductList = createAsyncThunk(
  'productList/fetchList',
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await productApi.getAllPaginated({ page, limit });
      return response.data; // Trả về { products, total, page, pages }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải danh sách sản phẩm');
    }
  }
);

const productListSlice = createSlice({
  name: 'productList',
  initialState: {
    products: [],
    page: 1,
    pages: 1, // Tổng số trang
    total: 0, // Tổng số sản phẩm
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchProductList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default productListSlice.reducer;