import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import orderApi from "../api/orderApi";
import { toast } from "react-toastify";

export const fetchProductSnapshot = createAsyncThunk(
  "order/fetchProductSnapshot",
  async ({ orderId, productId }, { rejectWithValue }) => {
    try {
      const res = await orderApi.productSnapshot(orderId, productId);
      return res.data;
    } catch (err) {
      toast.error("Không thể tải snapshot sản phẩm");
      return rejectWithValue(err.response?.data || "Error");
    }
  }
);

const snapshotSlice = createSlice({
  name: "snapshot",
  initialState: {
    snapshot: null,
    currentProductId: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearSnapshot: (state) => {
      state.snapshot = null;
      state.currentProductId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductSnapshot.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductSnapshot.fulfilled, (state, action) => {
        state.isLoading = false;
        state.snapshot = action.payload.snapshot;
        console.log("snapshot:" + state.snapshot);
        state.currentProductId = action.payload.currentProductId;
      })
      .addCase(fetchProductSnapshot.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSnapshot } = snapshotSlice.actions;
export default snapshotSlice.reducer;
