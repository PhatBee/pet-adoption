import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import AdminLoginForm from '../../components/AdminLoginForm';
import type { RootState } from '../../store/store'; 

const AdminLoginPage = () => {
  const router = useRouter();
  // Lấy token từ Redux
  const { token } = useSelector((state: RootState) => state.auth);

  // Nếu đã đăng nhập, chuyển hướng sang dashboard
  useEffect(() => {
    if (token) {
      router.push('/admin/dashboard'); // Hoặc trang admin chính của bạn
    }
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <AdminLoginForm />
    </div>
  );
};

export default AdminLoginPage;