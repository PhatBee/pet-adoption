import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "../api/axiosClient";

const API_URL = "/admin/orders";

export interface Order {
  _id: string;
  status: OrderStatus;
  [key: string]: any;
}

export type OrderStatus = 
  'pending' | 'confirmed' | 'preparing' | 'shipping' | 
  'delivered' | 'cancelled' | 'cancel_requested' | 'refunded';

export interface FetchOrdersResponse {
  data: Order[];
  meta?: { total: number; page: number; limit: number };
}

export interface OrdersState {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  selectedOrder: Order | null;
  detailLoading: boolean;
  updating: boolean;
  filters: { status: string; q: string };
}

export const fetchOrders = createAsyncThunk<
  FetchOrdersResponse,
  { page?: number; limit?: number; status?: string; q?: string },
  { rejectValue: string }
>(
    "adminOrders/fetchOrders",
    async ({ page = 1, limit = 20, status = "", q = "" } = {}, { rejectWithValue }) => {
        try {
            const res = await axiosClient.get(API_URL, { params: { page, limit, status, q }, withCredentials: true });
            return res.data as FetchOrdersResponse;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Lỗi khi lấy danh sách đơn");
        }
    }
);

export const fetchOrderById = createAsyncThunk<
  { data: Order },
  string,
  { rejectValue: string }
>(
    "adminOrders/fetchOrderById",
    async (orderId, { rejectWithValue }) => {
        try {
            const res = await axiosClient.get(`${API_URL}/${orderId}`, { withCredentials: true });
            return res.data as { data: Order };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Lỗi khi lấy chi tiết đơn");
        }
    }
);

export const updateOrderStatus = createAsyncThunk<
    { id: string; status: string; order: Order | null },
    { id: string; status: string },
    { rejectValue: string }
>(
    "adminOrders/updateOrderStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const res = await axiosClient.patch(`${API_URL}/${id}/status`, { status }, { withCredentials: true });
            const orderResult = res.data.order as Order | null;
            return { id, status, order: orderResult };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Lỗi khi cập nhật trạng thái");
        }
    }
);

export const bulkUpdateStatus = createAsyncThunk<
  any,
  { ids: string[]; status: string },
  { rejectValue: string }
>(
    "adminOrders/bulkUpdateStatus",
    async ({ ids = [], status }, { rejectWithValue }) => {
        try {
            const res = await axiosClient.patch(`${API_URL}/bulk/status`, { ids, status }, { withCredentials: true });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Lỗi bulk update");
        }
    }
);

const initialState: OrdersState = {
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
};

const slice = createSlice({
    name: "adminOrders",
    initialState,
    reducers: {
        clearSelectedOrder: (s) => { s.selectedOrder = null; s.detailLoading = false; },
        setFilters: (state, action: PayloadAction<{ status?: string; q?: string }>) => {
            state.filters = { ...state.filters, ...action.payload };
            // Khi thay filter/search, quay lại trang 1
            state.page = 1;
            
        },

        // thêm action setPage để chuyển trang
        setPage: (s, action: PayloadAction<number>) => {
        s.page = action.payload;
        },

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
            .addCase(fetchOrders.rejected, (s, a) => { s.loading = false; s.error = a.payload ?? null; })

            .addCase(fetchOrderById.pending, (s) => { s.detailLoading = true; s.selectedOrder = null; })
            .addCase(fetchOrderById.fulfilled, (s, a) => { s.detailLoading = false; s.selectedOrder = a.payload.data; })
            .addCase(fetchOrderById.rejected, (s, a) => { s.detailLoading = false; s.error = a.payload ?? null; })

            .addCase(updateOrderStatus.pending, (s) => { s.updating = true; })
            .addCase(updateOrderStatus.fulfilled, (s, a) => {
                s.updating = false;
                const updatedOrder = a.payload.order;
                if (!updatedOrder) return;
                // cập nhật trong danh sách
                s.orders = s.orders.map(o => (o._id === updatedOrder._id ? updatedOrder : o));
                // cập nhật modal nếu đang mở
                if (s.selectedOrder && s.selectedOrder._id === updatedOrder._id) {
                    s.selectedOrder = updatedOrder;
                }
            })
            .addCase(updateOrderStatus.rejected, (s, a) => { s.updating = false; s.error = a.payload ?? null; })

            .addCase(bulkUpdateStatus.pending, (s) => { s.updating = true; })
            .addCase(bulkUpdateStatus.fulfilled, (s, a) => { s.updating = false; /* refresh or update reducers */ })
            .addCase(bulkUpdateStatus.rejected, (s, a) => { s.updating = false; s.error = a.payload ?? null; });
    }
});

export const { clearSelectedOrder, setFilters, resetOrders, setPage  } = slice.actions;
export default slice.reducer;
