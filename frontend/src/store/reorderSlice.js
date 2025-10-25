import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import orderApi from "../api/orderApi";

export const fetchReorderItems = createAsyncThunk(
  "reorder/fetchReorderItems",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await orderApi.reorderInfo(orderId);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const reorderSlice = createSlice({
  name: "reorder",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    clearReorder: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReorderItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReorderItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        console.log("Reorder items fetched:", action.payload);
        // === THAY ĐỔI 2: Chỉ lưu 'available' vào state 'items' ===
        // action.payload giờ là { available, unavailable }
        state.items = action.payload.available || [];
      })
      .addCase(fetchReorderItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearReorder } = reorderSlice.actions;
export default reorderSlice.reducer;
