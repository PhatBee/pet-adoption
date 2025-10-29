import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import userApi from '../api/userApi';
import { User, UserQueryDto, PaginatedResult } from '../../types/next'; 

interface UserState {
    users: User[];
    loading: boolean;
    error: string | null;
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
    query: UserQueryDto;
}

const initialState: UserState = {
    users: [],
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

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (query: UserQueryDto, { rejectWithValue }) => {
        try {
            return await userApi.getUsers(query);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

const adminUserSlice = createSlice({
    name: 'adminUsers',
    initialState,
    reducers: {
        setUserQuery: (state, action: PayloadAction<Partial<UserQueryDto>>) => {
            state.query = { ...state.query, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<PaginatedResult<User>>) => {
                state.loading = false;
                state.users = action.payload.data;
                state.pagination = {
                    totalItems: action.payload.totalItems,
                    totalPages: action.payload.totalPages,
                    currentPage: action.payload.currentPage,
                    limit: state.query.limit || 10,
                };
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.users = [];
            });
    },
});

export const { setUserQuery } = adminUserSlice.actions;
export default adminUserSlice.reducer;