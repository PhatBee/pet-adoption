import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PaginatedResult } from '../../types/next';
import couponApi from '../api/couponApi';
import { Coupon, CreateCouponDto, UpdateCouponDto, CouponQueryDto } from '../../types/next';

type LoadingState = 'idle' | 'pending' | 'succeeded' | 'failed';

interface AdminCouponState {
  coupons: Coupon[];
  pagination: Omit<PaginatedResult<any>, 'data'> | null;
  loading: LoadingState;
  error: string | null;
}

const initialState: AdminCouponState = {
  coupons: [],
  pagination: null,
  loading: 'idle',
  error: null,
};

export const fetchCoupons = createAsyncThunk(
  'adminCoupons/fetchCoupons',
  async (query: CouponQueryDto, { rejectWithValue }) => {
    try {
      const response = await couponApi.findAll(query);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const createCoupon = createAsyncThunk(
  'adminCoupons/createCoupon',
  async (dto: CreateCouponDto, { rejectWithValue }) => {
    try {
      const response = await couponApi.create(dto);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateCoupon = createAsyncThunk(
  'adminCoupons/updateCoupon',
  async ({ id, dto }: { id: string; dto: UpdateCouponDto }, { rejectWithValue }) => {
    try {
      const response = await couponApi.update(id, dto);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const deleteCoupon = createAsyncThunk(
  'adminCoupons/deleteCoupon',
  async (id: string, { rejectWithValue }) => {
    try {
      await couponApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const disableCoupon = createAsyncThunk(
    'adminCoupons/disableCoupon',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await couponApi.disable(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    },
);

// --- Slice ---

const adminCouponSlice = createSlice({
  name: 'adminCoupons',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Coupons
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(
        fetchCoupons.fulfilled,
        (state, action: PayloadAction<PaginatedResult<Coupon>>) => {
          state.loading = 'succeeded';
          state.coupons = action.payload.data;
          state.pagination = {
            totalItems: action.payload.totalItems,
            totalPages: action.payload.totalPages,
            currentPage: action.payload.currentPage,
          };
        },
      )
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })

      // Create Coupon
      .addCase(createCoupon.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(createCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
        state.loading = 'succeeded';
        state.coupons.unshift(action.payload);
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })

      .addCase(updateCoupon.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(updateCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
        state.loading = 'succeeded';
        const index = state.coupons.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.coupons[index] = action.payload;
        }
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })

      .addCase(disableCoupon.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(disableCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
        state.loading = 'succeeded';
        const index = state.coupons.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.coupons[index] = action.payload;
        }
      })
      .addCase(disableCoupon.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })

      .addCase(deleteCoupon.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(deleteCoupon.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = 'succeeded';
        state.coupons = state.coupons.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default adminCouponSlice.reducer;