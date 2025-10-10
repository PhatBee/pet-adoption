import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productService from "../api/productApi";
import { toast } from "react-toastify";

// Async thunks
export const fetchProducts = createAsyncThunk(
  "products/home",
  async (_, thunkAPI) => {
    try {
      return await productService.getAll();
    } catch (error) {
      toast.error("Lỗi khi tải sản phẩm");
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    // newest: [],
    // bestSellers: [],
    // mostViewed: [],
    // topDiscounts: [],
    sections: [],
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // state.newest = action.payload.newest || [];
        // state.bestSellers = action.payload.bestSellers || [];
        // state.mostViewed = action.payload.mostViewed || [];
        // state.topDiscounts = action.payload.topDiscounts || [];
        state.sections = action.payload.sections || []; 

      })
      .addCase(fetchProducts.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default productSlice.reducer;
