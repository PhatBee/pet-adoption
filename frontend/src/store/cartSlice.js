import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartApi from '../api/cartApi';

// Gọi API để thêm sản phẩm vào giỏ hàng
export const addCartItem = createAsyncThunk(
    'cart/addCartItem',
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            const response = await cartApi.addItem({ productId, quantity });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
        }
    }
);

// Goi API để lấy giỏ hàng
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartApi.getCart();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy giỏ hàng');
        }
    }
);

// Gọi Api để xóa sản phẩm khỏi giỏ hàng
export const removeCartItem = createAsyncThunk(
    'cart/removeItem',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await cartApi.removeItem(productId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa sản phẩm khỏi giỏ hàng');
        }
    }
);

// Gọi API để cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItem = createAsyncThunk(
    'cart/updateItem',
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            const response = await cartApi.updateItem({ productId, quantity });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật sản phẩm trong giỏ hàng');
        }
    }
);

// Gọi API để xóa toàn bộ giỏ hàng
export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartApi.clearCart();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa giỏ hàng');
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        isLoading: false,
        error: null,
    },
    reducers: {
        // Các reducer khác nếu cần
    },
    extraReducers: (builder) => {
        builder
        // Xử lý fetchCart
            .addCase(fetchCart.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                state.error = null;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
        // Xử lý addCartItem
            .addCase(addCartItem.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addCartItem.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                console.log(action.payload.items);
                state.error = null;
            })
            .addCase(addCartItem.rejected, (state, action) => {
                state.isLoading = false;
                console.log(action.payload.items);

                state.error = action.payload;
            })
            // Xử lý removeCartItem
            .addCase(removeCartItem.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(removeCartItem.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                state.error = null;
            })
            .addCase(removeCartItem.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Xử lý updateCartItem
            .addCase(updateCartItem.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                state.error = null;
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Xử lý clearCart
            .addCase(clearCart.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(clearCart.fulfilled, (state) => {
                state.isLoading = false;
                state.items = [];
                state.error = null;
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
        
    },
});

export default cartSlice.reducer;
