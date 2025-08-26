import { createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, logoutApi } from '../api/authApi';

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