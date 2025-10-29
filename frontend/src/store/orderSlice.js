import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import checkoutApi from "../api/checkoutApi";
import orderApi from "../api/orderApi";
import couponApi from "../api/couponApi";
import { toast } from "react-toastify";
import axiosClient from "../api/axiosClient";

export const fetchCheckoutData = createAsyncThunk("order/fetchCheckoutData", async (_, { rejectWithValue }) => {
  try {
    const res = await checkoutApi.getCheckoutData();
    return res.data; // { cart, addresses }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Lỗi khi lấy dữ liệu checkout");
  }
});

export const applyCoupon = createAsyncThunk(
  "order/applyCoupon",
  async ({ code, itemsTotal }, { rejectWithValue }) => {
    try {
      const res = await couponApi.validate({ code, itemsTotal });
      toast.success(res.data.message);
      return res.data.coupon; // Trả về object coupon nếu thành công
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Áp dụng mã thất bại";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const placeOrder = createAsyncThunk("order/placeOrder", async ({ shippingAddress, paymentMethod, items, couponCode, pointsToUse }, { rejectWithValue }) => {
  try {
    // Truyền `items` vào payload của API call
    const res = await checkoutApi.placeOrder({ shippingAddress, paymentMethod, items, couponCode, pointsToUse });
    return res.data; // { orderId, order } or { redirectUrl }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Đặt hàng thất bại");
  }
});

// fetch page (lazy loading)
export const fetchMyOrders = createAsyncThunk(
  "orders/fetchMyOrders",
  async ({ page = 1, limit = 10, status = null } = {}, { rejectWithValue }) => {
    try {
      const res = await orderApi.fetchMyOrders({ page, limit, status });
      console.log("test fetch order: ", res.data);
      return { ...res.data, page, status }; // { items, total, limit, page }
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

export const requestCancelOrder = createAsyncThunk(
  "orders/requestCancelOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await orderApi.requestCancelOrder(orderId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Úi chà chà, lỗi rồi!");
    }
  }
);

const slice = createSlice({
  name: "order",
  initialState: {
    cart: null, addresses: [], isLoading: false, error: null, lastOrder: null,
    items: [], // array of orders (concatenated pages)
    page: 0,
    limit: 10,
    total: 0,
    status: null,
    hasMore: true,
    currentOrder: null,
    detailLoading: false,
    appliedCoupon: null, // Lưu trữ coupon object nếu hợp lệ
    pointsToUse: 0,
    couponValidationStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    couponError: null,
    availableItems: [],
    unavailableItems: [],
    loading: false,
    error: null
  },
  reducers: {
    resetOrders: (s) => {
      s.items = []; s.page = 0; s.total = 0; s.hasMore = true; s.error = null;
    },

    setPointsToUse: (state, action) => {
      // Có thể thêm logic kiểm tra số điểm không được vượt quá điểm user có
      state.pointsToUse = action.payload;
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      state.couponError = null;
      state.couponValidationStatus = 'idle';
    },

    clearLastOrder: (state) => {
      state.lastOrder = null;
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
        const { items = [], total = 0, page = 1, limit = 10, status } = payload;
        // Nếu đây là trang đầu tiên hoặc filter thay đổi, hãy reset danh sách
        if (page === 1 || status !== s.status) {
          s.items = items;
        } else { // Nếu không thì nối vào danh sách cũ (load more)
          s.items = s.items.concat(items);
        }
        s.page = page;
        s.limit = limit;
        s.total = total;
        s.status = status; // Lưu lại trạng thái vừa lọc
        s.hasMore = (s.items.length < total);
      })
      .addCase(fetchMyOrders.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; toast.error(a.payload); })

      .addCase(fetchOrderDetail.pending, (s) => { s.detailLoading = true; s.currentOrder = null; })
      .addCase(fetchOrderDetail.fulfilled, (s, a) => { s.detailLoading = false; s.currentOrder = a.payload; })
      .addCase(fetchOrderDetail.rejected, (s, a) => { s.detailLoading = false; s.currentOrder = null; toast.error(a.payload); })

      .addCase(applyCoupon.pending, (state) => {
        state.couponValidationStatus = 'loading';
        state.couponError = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.couponValidationStatus = 'succeeded';
        state.appliedCoupon = action.payload;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.couponValidationStatus = 'failed';
        state.appliedCoupon = null;
        state.couponError = action.payload;
      })
      .addCase(requestCancelOrder.fulfilled, (state, action) => {
        const idx = state.items.findIndex(o => o._id === action.payload._id);
        if (idx >= 0) state.items[idx] = action.payload;
      });
  }
});

export const { resetOrders, setPointsToUse, removeCoupon, clearLastOrder  } = slice.actions;
export default slice.reducer;
