import React, { useState } from "react";
// Import Redux Hooks và Action
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin } from '../store/slices/authSlice';
import type { RootState, AppDispatch } from '../store/store';


const AdminLoginForm = () => {
  const [form, setForm] = useState({ 
    email: "", 
    password: "" 
  });

  // Lấy dispatch function
const dispatch = useDispatch<AppDispatch>();
  
  // Lấy trạng thái từ Redux store
const { isLoading, error } = useSelector((state: RootState) => state.auth);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ 
      ...prev, 
      [e.target.name]: e.target.value 
    }));
  };

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Gọi action loginAdmin thay vì prop
    dispatch(loginAdmin(form)); 
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
        Admin Đăng nhập
      </h2>
      
      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Email
          </label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            type="email"
            name="email"
            placeholder="Nhập email admin"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Mật khẩu
          </label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
            />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50"
        >
          {isLoading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      {/* Trang admin thường không có "Đăng ký" */}
    </div>
  );
};

// PropTypes không còn cần thiết nếu component tự quản lý dispatch
// (Trừ khi bạn muốn truyền props từ page vào)

export default AdminLoginForm;