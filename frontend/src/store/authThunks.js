import { createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, logoutApi, refreshTokenApi, meApi } from '../api/authApi';
import { setCredentials } from './authSlice';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials);
      
      // Format dữ liệu trả về
      return {
        user: {
          id: response.data.user._id,
          name: response.data.user.name,
          email: response.data.user.email,
          avatarUrl: response.data.user.avatarUrl || null,
          phone: response.data.user.phone || null,
          role: response.data.user.role || null,
          addresses: response.data.user.addresses,
          loyaltyPoints: response.data.user.loyaltyPoints || 0
        },
        accessToken: response.data.accessToken
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      return null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Logout failed'
      );
    }
  }
);

export const refreshSessionThunk = createAsyncThunk(
  'auth/refreshSession',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Gọi API để lấy accessToken mới
      const refreshResponse = await refreshTokenApi();
      const { accessToken } = refreshResponse.data;

      // Khi có accessToken, chúng ta cần lấy lại thông tin user
      // Giả sử bạn có một meApi để lấy thông tin user đã đăng nhập
      // Nếu chưa có, bạn cần tạo nó ở backend (trả về req.user)
      const meResponse = await meApi(); 

      // Dispatch action để cập nhật cả user và accessToken vào state
      dispatch(setCredentials({ user: meResponse.data.user, accessToken }));
      return { user: meResponse.data.user, accessToken };

    } catch (error) {
      // Nếu có lỗi (ví dụ: refresh token hết hạn), không cần làm gì cả
      // Người dùng sẽ ở trạng thái đăng xuất một cách tự nhiên
      return rejectWithValue('Không thể làm mới phiên đăng nhập');
    }
  }
);