import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import checkoutApi from "../api/checkoutApi";

export const fetchCheckoutData = createAsyncThunk("order/fetchCheckoutData", async (_, { rejectWithValue }) => {
  try {
    const res = await checkoutApi.getCheckoutData();
    return res.data; // { cart, addresses }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Lỗi khi lấy dữ liệu checkout");
  }
});

export const placeOrder = createAsyncThunk("order/placeOrder", async ({ shippingAddress, paymentMethod }, { rejectWithValue }) => {
  try {
    const res = await checkoutApi.placeOrder({ shippingAddress, paymentMethod });
    return res.data; // { orderId, order } or { redirectUrl }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Đặt hàng thất bại");
  }
});

const slice = createSlice({
  name: "order",
  initialState: { cart: null, addresses: [], isLoading: false, error: null, lastOrder: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCheckoutData.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchCheckoutData.fulfilled, (s, a) => {
        s.isLoading = false;
        s.cart = a.payload.cart;
        s.addresses = a.payload.addresses || [];
      })
      .addCase(fetchCheckoutData.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })

      .addCase(placeOrder.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(placeOrder.fulfilled, (s, a) => { s.isLoading = false; s.lastOrder = a.payload; })
      .addCase(placeOrder.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; });
  }
});

export default slice.reducer;
