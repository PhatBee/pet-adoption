import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import checkoutApi from "../api/checkoutApi";
import orderApi from "../api/orderApi";
import { toast } from "react-toastify";

export const fetchCheckoutData = createAsyncThunk("order/fetchCheckoutData", async (_, { rejectWithValue }) => {
  try {
    const res = await checkoutApi.getCheckoutData();
    return res.data; // { cart, addresses }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Lỗi khi lấy dữ liệu checkout");
  }
});

export const placeOrder = createAsyncThunk("order/placeOrder", async ({ shippingAddress, paymentMethod, items }, { rejectWithValue }) => {
  try {
    // Truyền `items` vào payload của API call
    const res = await checkoutApi.placeOrder({ shippingAddress, paymentMethod, items });
    return res.data; // { orderId, order } or { redirectUrl }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Đặt hàng thất bại");
  }
});

// fetch page (lazy loading)
export const fetchMyOrders = createAsyncThunk(
  "orders/fetchMyOrders",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const res = await orderApi.fetchMyOrders({ page, limit });
      console.log("test fetch order: ", res.data);
      return { ...res.data, page }; // { items, total, limit, page }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi tải đơn");
    }
  }
);

export const fetchOrderDetail = createAsyncThunk(
  "orders/fetchOrderDetail",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await orderApi.getOrderById(orderId);
      return res.data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi lấy chi tiết đơn");
    }
  }
);

const slice = createSlice({
  name: "order",
  initialState: { cart: null, addresses: [], isLoading: false, error: null, lastOrder: null,
    items: [], // array of orders (concatenated pages)
    page: 0,
    limit: 10,
    total: 0,
    hasMore: true,
    currentOrder: null,
    detailLoading: false,
   },
  reducers: {
     resetOrders: (s) => {
      s.items = []; s.page = 0; s.total = 0; s.hasMore = true; s.error = null;
    }
  },
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
      .addCase(placeOrder.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })

      .addCase(fetchMyOrders.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchMyOrders.fulfilled, (s, { payload }) => {
        s.isLoading = false;
        const { items = [], total = 0, page = 1, limit = 10 } = payload;
        if (page === 1) s.items = items;
        else s.items = s.items.concat(items);
        s.page = page;
        s.limit = limit;
        s.total = total;
        s.hasMore = (s.items.length < total);
      })
      .addCase(fetchMyOrders.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; toast.error(a.payload); })

      .addCase(fetchOrderDetail.pending, (s) => { s.detailLoading = true; s.currentOrder = null; })
      .addCase(fetchOrderDetail.fulfilled, (s, a) => { s.detailLoading = false; s.currentOrder = a.payload; })
      .addCase(fetchOrderDetail.rejected, (s, a) => { s.detailLoading = false; s.currentOrder = null; toast.error(a.payload); });
 
  }
});

export const { resetOrders } = slice.actions;
export default slice.reducer;
