// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginAdminApi, LoginCredentials, LoginResponse } from '../api/authApi';

interface AuthState {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// 🧠 Dùng hàm API riêng biệt
export const loginAdmin = createAsyncThunk<
  LoginResponse,         // Thành công
  LoginCredentials,      // Input
  { rejectValue: string } // Lỗi
>(
  'auth/loginAdmin',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await loginAdminApi(credentials);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Đăng nhập thất bại');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Đăng nhập thất bại';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
