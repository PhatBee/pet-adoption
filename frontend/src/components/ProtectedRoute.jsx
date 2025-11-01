// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
// Giả sử bạn có selector này từ authSlice
import { selectIsAuthenticated } from '../store/authSlice'; 

/**
 * Component này sẽ:
 * 1. Kiểm tra xem người dùng đã đăng nhập (lấy từ Redux) hay chưa.
 * 2. Nếu đã đăng nhập, cho phép hiển thị trang con (children).
 * 3. Nếu CHƯA đăng nhập, chuyển hướng về /login và "nhớ" lại 
 * trang họ đang cố vào (state: { from: location }).
 */
export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Chuyển hướng người dùng về trang login
    // `replace` để không lưu trang hiện tại vào lịch sử trình duyệt
    // `state` để trang Login biết cần quay lại đâu sau khi đăng nhập thành công
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập, hiển thị trang
  return children;
}