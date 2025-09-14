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
            .addCase(addCartItem.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addCartItem.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                state.error = null;
            })
            .addCase(addCartItem.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export default cartSlice.reducer;
