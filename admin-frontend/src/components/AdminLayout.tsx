import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import AdminSidebar from './AdminSideBar';
import { selectUser } from '../store/slices/authSlice'; // (Mình giả định đường dẫn này)

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const user = useSelector(selectUser);
  const router = useRouter();

  // Logic bảo vệ route:
  // Chuyển hướng về /admin/login nếu chưa đăng nhập
  useEffect(() => {
    // (Giả sử ban đầu user là null, và đang loading từ localStorage)
    // Tùy vào logic authSlice của bạn, bạn có thể cần check cả `token`
    if (!user) {
      // Dùng router.replace để không lưu vào history
      router.replace('/admin/login');
    }
  }, [user, router]);

  // Nếu chưa có user, hiển thị loading để tránh "nháy" sang trang login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* (Bạn có thể thêm 1 spinner đẹp ở đây) */}
        <p>Đang tải...</p>
      </div>
    );
  }

  // Nếu đã đăng nhập, hiển thị layout và nội dung trang
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* {children} chính là nội dung của trang con (Dashboard, Products,...) */}
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;