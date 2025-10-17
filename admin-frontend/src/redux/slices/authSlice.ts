// src/redux/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { loginApi } from '../../services/api'; // Sẽ tạo ở bước sau
import { LoginCredentials } from '../../types'; // Sẽ tạo ở bước sau

interface LoginResponse {
  access_token: string;
}

// Định nghĩa kiểu dữ liệu cho trạng thái của slice này
interface AuthState {
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Trạng thái ban đầu
const initialState: AuthState = {
  token: null,
  isLoading: false,
  error: null,
};

// Tạo một "thunk" để xử lý hành động đăng nhập bất đồng bộ
export const loginAdmin = createAsyncThunk<
  LoginResponse,              // dữ liệu trả về khi thành công
  LoginCredentials,           // dữ liệu đầu vào
  { rejectValue: string }     // dữ liệu trả về khi reject
>(
  'auth/loginAdmin',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const data = await loginApi(credentials.email, credentials.password);
      // API thành công, trả về dữ liệu (chứa access_token)
      return data;
    } catch (err) {
      // API thất bại, trả về thông điệp lỗi
      const error = err as { response?: { data?: { message?: string } } };

      const errorMessage = error.response?.data?.message || 'Đã có lỗi xảy ra';
      return rejectWithValue(errorMessage);
    }
  }
);

// Tạo slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Thêm reducer để logout (xóa token)
    logout: (state) => {
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý khi thunk `loginAdmin` đang chạy
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Xử lý khi thunk `loginAdmin` thành công
      .addCase(loginAdmin.fulfilled, (state, action: PayloadAction<{ access_token: string }>) => {
        state.isLoading = false;
        state.token = action.payload.access_token;
      })
      // Xử lý khi thunk `loginAdmin` thất bại
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Đăng nhập thất bại';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;