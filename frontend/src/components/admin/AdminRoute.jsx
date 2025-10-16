import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectUser, selectAuthLoading } from '../../store/authSlice';
import ForbiddenPage from '../../pages/ForbiddenPage';

// Component này sẽ "bọc" các route cần quyền admin
export default function AdminRoute({ children }) {
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthLoading);
  const location = useLocation();

  // Trong lúc đang kiểm tra phiên đăng nhập, hiển thị loading
  if (isLoading) {
    return <div className="p-6 text-center">Đang kiểm tra quyền truy cập...</div>;
  }

  // Nếu đã kiểm tra xong và có user là admin
  if (user && user.role === 'admin') {
    return children; // Hiển thị trang admin
  }

  // Nếu có user nhưng không phải admin
  if (user && user.role !== 'admin') {
    return <ForbiddenPage />; // Hiển thị trang lỗi 403
  }

  // Nếu không có user (chưa đăng nhập)
  // Chuyển hướng về trang đăng nhập và lưu lại trang họ đang muốn vào
  return <Navigate to="/login" state={{ from: location }} replace />;
}