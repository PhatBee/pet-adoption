import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import categoryApi from '../api/categoryApi';
import { QueryDto, CreateDto, ResponseDto, PaginatedData } from '../../types/petCate.dto';
import { PaginatedResult } from '../../types/next';

interface AdminCategoryState {
  items: ResponseDto[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
  pagination: PaginatedResult<ResponseDto> | null;
  query: QueryDto;
}

const initialState: AdminCategoryState = {
  items: [],
  loading: 'idle',
  error: null,
  pagination: null,
  query: { page: 1, limit: 10, search: '' },
};

export const fetchCategories = createAsyncThunk(
  'adminCategories/fetch',
  async (query: QueryDto, { rejectWithValue }) => {
    try {
      return await categoryApi.findAll(query);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Tải Thể loại thất bại');
    }
  }
);

export const createCategory = createAsyncThunk(
  'adminCategories/create',
  async (dto: CreateDto, { rejectWithValue, dispatch, getState }) => {
    try {
      await categoryApi.create(dto);
      toast.success('Tạo thể loại thành công!');
      const { query } = (getState() as any).adminCategories;
      dispatch(fetchCategories({ ...query, page: 1 }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Tạo thể loại thất bại');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'adminCategories/update',
  async ({ id, dto }: { id: string, dto: CreateDto }, { rejectWithValue, dispatch, getState }) => {
    try {
      await categoryApi.update(id, dto);
      toast.success('Cập nhật thể loại thành công!');
      const { query } = (getState() as any).adminCategories;
      dispatch(fetchCategories(query));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'adminCategories/delete',
  async (id: string, { rejectWithValue, dispatch, getState }) => {
    try {
      await categoryApi.remove(id);
      toast.success('Xóa thể loại thành công!');
      const { query } = (getState() as any).adminCategories;
      dispatch(fetchCategories(query));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xóa thất bại');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const adminCategorySlice = createSlice({
  name: 'adminCategories',
  initialState,
  reducers: {
    setCategoryQuery: (state, action: PayloadAction<Partial<QueryDto>>) => {
      state.query = { ...state.query, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<PaginatedData>) => {
        state.loading = 'succeeded';
        state.items = action.payload.data;
        state.pagination = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      .addCase(createCategory.pending, (state) => { state.loading = 'pending'; })
      .addCase(createCategory.rejected, (state) => { state.loading = 'failed'; })
      .addCase(createCategory.fulfilled, (state) => { state.loading = 'succeeded'; })
      .addCase(updateCategory.pending, (state) => { state.loading = 'pending'; })
      .addCase(updateCategory.rejected, (state) => { state.loading = 'failed'; })
      .addCase(updateCategory.fulfilled, (state) => { state.loading = 'succeeded'; })
      .addCase(deleteCategory.pending, (state) => { state.loading = 'pending'; })
      .addCase(deleteCategory.rejected, (state) => { state.loading = 'failed'; })
      .addCase(deleteCategory.fulfilled, (state) => { state.loading = 'succeeded'; });
  },
});

export const { setCategoryQuery } = adminCategorySlice.actions;
export default adminCategorySlice.reducer;