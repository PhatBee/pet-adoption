import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import productApi from '../api/productApi';
import { Product, ProductQueryDto, PaginatedResult } from '../../types/next'; 

interface ProductState {
    products: Product[];
    loading: boolean;
    error: string | null;
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
    query: ProductQueryDto;
}

const initialState: ProductState = {
    products: [],
    loading: false,
    error: null,
    pagination: {
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10,
    },
    query: {
        page: 1,
        limit: 10,
    },
};

export const fetchProducts = createAsyncThunk(
    'product/fetchProducts',
    async (query: ProductQueryDto, { rejectWithValue }) => {
        try {
            return await productApi.getProducts(query);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
        }
    }
);

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setProductQuery: (state, action: PayloadAction<Partial<ProductQueryDto>>) => {
            state.query = { ...state.query, ...action.payload };
        },
        productActionSuccess: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<PaginatedResult<Product>>) => {
                state.loading = false;
                state.products = action.payload.data;
                state.pagination = {
                    totalItems: action.payload.totalItems,
                    totalPages: action.payload.totalPages,
                    currentPage: action.payload.currentPage,
                    limit: state.query.limit || 10,
                };
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.products = [];
            });
    },
});

export const { setProductQuery, productActionSuccess } = productSlice.actions;
export default productSlice.reducer;