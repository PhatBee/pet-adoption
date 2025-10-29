import React from 'react';
import { useRouter } from 'next/router';
import { clearAccessToken } from '../utils/tokenStorage';
import { LogOut } from 'lucide-react';
import { persistor } from '../store/store'; // 👈 import thêm


const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    clearAccessToken();
    await persistor.purge(); 
    router.replace('/admin/login');};

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
    >
      <LogOut className="w-5 h-5" />
      <span>Đăng xuất</span>
    </button>
  );
};

export default LogoutButton;