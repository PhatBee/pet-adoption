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
        // Thêm state để lưu các ID sản phẩm được chọn
        selectedItems: [], 
    },
    // Thêm reducers để quản lý việc chọn sản phẩm
    reducers: {
        toggleSelectItem: (state, action) => {
            const productId = action.payload;
            const index = state.selectedItems.indexOf(productId);
            if (index > -1) {
                // Nếu đã có -> bỏ chọn
                state.selectedItems.splice(index, 1);
            } else {
                // Nếu chưa có -> chọn
                state.selectedItems.push(productId);
            }
        },

        selectAllItems: (state) => {
            state.selectedItems = state.items.map(item => item.product._id);
        },
        deselectAllItems: (state) => {
            state.selectedItems = [];
        },
        // Reducer để xóa các item đã chọn sau khi thanh toán thành công
        clearSelectedItems: (state) => {
            state.selectedItems = [];
        }
    },
    extraReducers: (builder) => {
        builder
        // Xử lý fetchCart
            .addCase(fetchCart.pending, (state) => {
                state.isLoading = true;
            })
            // Khi fetch giỏ hàng thành công, mặc định chọn tất cả cho tiện
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                // Mặc định chọn tất cả sản phẩm khi tải giỏ hàng
                state.selectedItems = action.payload.items.map(item => item.product._id);
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
            // Khi xóa toàn bộ giỏ hàng, cũng xóa luôn các item đã chọn
            .addCase(clearCart.fulfilled, (state) => {
                state.isLoading = false;
                state.items = [];
                state.selectedItems = []; // Xóa luôn ở đây
                state.error = null;
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
        
    },
});

export const { toggleSelectItem, selectAllItems, deselectAllItems, clearSelectedItems } = cartSlice.actions;

export default cartSlice.reducer;
