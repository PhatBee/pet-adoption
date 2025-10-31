import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import petApi from '../api/petApi';
import { QueryDto, CreateDto, ResponseDto, PaginatedData } from '../../types/petCate.dto';
import { PaginatedResult } from '../../types/next';

interface AdminPetState {
  items: ResponseDto[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
  pagination: PaginatedResult<ResponseDto> | null;
  query: QueryDto;
}

const initialState: AdminPetState = {
  items: [],
  loading: 'idle',
  error: null,
  pagination: null,
  query: { page: 1, limit: 10, search: '' },
};

export const fetchPets = createAsyncThunk(
  'adminPets/fetch',
  async (query: QueryDto, { rejectWithValue }) => {
    try {
      return await petApi.findAll(query);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Tải Thú cưng thất bại');
    }
  }
);

export const createPet = createAsyncThunk(
  'adminPets/create',
  async (dto: CreateDto, { rejectWithValue, dispatch, getState }) => {
    try {
      await petApi.create(dto);
      toast.success('Tạo thú cưng thành công!');
      const { query } = (getState() as any).adminPets;
      dispatch(fetchPets({ ...query, page: 1 }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Tạo thất bại');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updatePet = createAsyncThunk(
  'adminPets/update',
  async ({ id, dto }: { id: string, dto: CreateDto }, { rejectWithValue, dispatch, getState }) => {
    try {
      await petApi.update(id, dto);
      toast.success('Cập nhật thú cưng thành công!');
      const { query } = (getState() as any).adminPets;
      dispatch(fetchPets(query));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deletePet = createAsyncThunk(
  'adminPets/delete',
  async (id: string, { rejectWithValue, dispatch, getState }) => {
    try {
      await petApi.remove(id);
      toast.success('Xóa thú cưng thành công!');
      const { query } = (getState() as any).adminPets;
      dispatch(fetchPets(query));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xóa thất bại');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const adminPetSlice = createSlice({
  name: 'adminPets',
  initialState,
  reducers: {
    setPetQuery: (state, action: PayloadAction<Partial<QueryDto>>) => {
      state.query = { ...state.query, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPets.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchPets.fulfilled, (state, action: PayloadAction<PaginatedData>) => {
        state.loading = 'succeeded';
        state.items = action.payload.data;
        state.pagination = action.payload;
      })
      .addCase(fetchPets.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      .addCase(createPet.pending, (state) => { state.loading = 'pending'; })
      .addCase(createPet.rejected, (state) => { state.loading = 'failed'; })
      .addCase(createPet.fulfilled, (state) => { state.loading = 'succeeded'; })
      .addCase(updatePet.pending, (state) => { state.loading = 'pending'; })
      .addCase(updatePet.rejected, (state) => { state.loading = 'failed'; })
      .addCase(updatePet.fulfilled, (state) => { state.loading = 'succeeded'; })
      .addCase(deletePet.pending, (state) => { state.loading = 'pending'; })
      .addCase(deletePet.rejected, (state) => { state.loading = 'failed'; })
      .addCase(deletePet.fulfilled, (state) => { state.loading = 'succeeded'; });
  },
});

export const { setPetQuery } = adminPetSlice.actions;
export default adminPetSlice.reducer;