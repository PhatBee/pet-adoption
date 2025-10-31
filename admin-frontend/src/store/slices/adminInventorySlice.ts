import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, PaginatedResult } from '../../types/next';
import { InventoryQueryDto, UpdateStockDto } from '../../types/inventory.dto';
import inventoryApi from '../api/inventoryApi';

interface AdminInventoryState {
  products: Product[];
  pagination: PaginatedResult<Product> | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AdminInventoryState = {
  products: [],
  pagination: null,
  loading: 'idle',
  error: null,
};


export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (query: InventoryQueryDto, { rejectWithValue }) => {
    try {
      return await inventoryApi.findAll(query);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải danh sách kho.');
    }
  },
);

export const updateProductStock = createAsyncThunk(
  'inventory/updateProductStock',
  async (
    { id, dto }: { id: string; dto: UpdateStockDto },
    { rejectWithValue },
  ) => {
    try {
      return await inventoryApi.updateStock(id, dto);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi cập nhật tồn kho.');
    }
  },
);

const adminInventorySlice = createSlice({
  name: 'adminInventory',
  initialState,
  reducers: {
    clearInventoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action: PayloadAction<PaginatedResult<Product>>) => {
        state.loading = 'succeeded';
        state.products = action.payload.data;
        state.pagination = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string || 'Tải danh sách kho thất bại.';
        state.products = [];
        state.pagination = null;
      })
      .addCase(updateProductStock.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(updateProductStock.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = 'succeeded';
        const updatedProduct = action.payload;
        state.products = state.products.map((p) =>
          p._id === updatedProduct._id ? updatedProduct : p,
        );
      })
      .addCase(updateProductStock.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string || 'Cập nhật tồn kho thất bại.';
      });
  },
});

export const { clearInventoryError } = adminInventorySlice.actions;

export default adminInventorySlice.reducer;