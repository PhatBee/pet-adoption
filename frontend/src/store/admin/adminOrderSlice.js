import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

const API_URL = "/admin/orders";

export const fetchOrders = createAsyncThunk(
  "adminOrders/fetchOrders",
  async ({ page = 1, limit = 20, status = "", q = "" } = {}, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(API_URL, { params: { page, limit, status, q }, withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi lấy danh sách đơn");
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "adminOrders/fetchOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(`${API_URL}/${orderId}`, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi lấy chi tiết đơn");
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "adminOrders/updateOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(`${API_URL}/${id}/status`, { status }, { withCredentials: true });
      return { id, status, order: res.data.order || null };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    }
  }
);

// (tùy chọn) bulk update
export const bulkUpdateStatus = createAsyncThunk(
  "adminOrders/bulkUpdateStatus",
  async ({ ids = [], status }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(`${API_URL}/bulk/status`, { ids, status }, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi bulk update");
    }
  }
);

// ----------------- SLICE -----------------
const slice = createSlice({
  name: "adminOrders",
  initialState: {
    orders: [],
    total: 0,
    page: 1,
    limit: 20,
    loading: false,
    error: null,
    selectedOrder: null,
    detailLoading: false,
    updating: false,
    filters: { status: "", q: "" },
  },
  reducers: {
    clearSelectedOrder: (s) => { s.selectedOrder = null; s.detailLoading = false; },
    setFilters: (s, a) => { s.filters = { ...s.filters, ...a.payload }; },
    resetOrders: (s) => {
      s.orders = []; s.page = 1; s.total = 0; s.error = null;
    },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchOrders.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchOrders.fulfilled, (s, a) => {
        console.log(a.payload);
        s.loading = false;
        s.orders = a.payload.data || [];
        s.total = a.payload.meta?.total ?? s.orders.length;
        s.page = a.payload.meta?.page ?? s.page;
        s.limit = a.payload.meta?.limit ?? s.limit;
      })
      .addCase(fetchOrders.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchOrderById.pending, (s) => { s.detailLoading = true; s.selectedOrder = null; })
      .addCase(fetchOrderById.fulfilled, (s, a) => { s.detailLoading = false; s.selectedOrder = a.payload.data; })
      .addCase(fetchOrderById.rejected, (s, a) => { s.detailLoading = false; s.error = a.payload; })

      .addCase(updateOrderStatus.pending, (s) => { s.updating = true; })
      .addCase(updateOrderStatus.fulfilled, (s, a) => {
        s.updating = false;
        const updatedOrder = a.payload?.order || a.payload;
        if (!updatedOrder) return;
        // cập nhật trong danh sách
        s.orders = s.orders.map(o => (o._id === updatedOrder._id ? updatedOrder : o));
        // cập nhật modal nếu đang mở
        if (s.selectedOrder && s.selectedOrder._id === updatedOrder._id) {
          s.selectedOrder = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (s, a) => { s.updating = false; s.error = a.payload; })

      .addCase(bulkUpdateStatus.pending, (s) => { s.updating = true; })
      .addCase(bulkUpdateStatus.fulfilled, (s, a) => { s.updating = false; /* refresh or update reducers */ })
      .addCase(bulkUpdateStatus.rejected, (s, a) => { s.updating = false; s.error = a.payload; });
  }
});

export const { clearSelectedOrder, setFilters, resetOrders } = slice.actions;
export default slice.reducer;
