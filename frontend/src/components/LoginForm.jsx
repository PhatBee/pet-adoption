import React, { useState } from "react";
import PropTypes from 'prop-types';

const LoginForm = ({ onSubmit, isLoading }) => {
  const [form, setForm] = useState({ 
    email: "", 
    password: "" 
  });

  const handleChange = (e) => {
    setForm((prev) => ({ 
      ...prev, 
      [e.target.name]: e.target.value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
        Đăng nhập
      </h2>
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
            placeholder="Nhập email của bạn"
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

      {/* Footer */}
      <p className="text-center text-sm text-gray-500 mt-4">
        Chưa có tài khoản?{" "}
        <a
          href="/register"
          className="text-indigo-600 font-medium hover:underline"
        >
          Đăng ký ngay
        </a>
      </p>
    </div>
  );
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default LoginForm;
