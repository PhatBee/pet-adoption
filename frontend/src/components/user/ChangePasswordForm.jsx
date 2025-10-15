import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { changePasswordApi } from '../../api/userApi'; // Make sure the path is correct

export default function ChangePasswordForm() {
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validate input
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 2. Call the API
      const response = await changePasswordApi({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      toast.success(response.data.message || "Đổi mật khẩu thành công!");
      // 3. Reset form
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-600">Mật khẩu cũ</label>
          <input
            type="password"
            name="oldPassword"
            value={passwords.oldPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-600">Mật khẩu mới</label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-600">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition disabled:opacity-50"
          >
            {isSubmitting ? "Đang xử lý..." : "Lưu mật khẩu"}
          </button>
        </div>
      </form>
    </div>
  );
}