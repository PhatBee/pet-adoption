import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // (Thêm các reducer khác ở đây, ví dụ: productReducer)
  },
});

// Export kiểu (type) cho state và dispatch (rất hữu ích với TypeScript)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;