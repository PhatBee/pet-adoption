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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Đăng nhập
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
            disabled={submitting}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md transition disabled:opacity-50"
          >
            {submitting ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Chưa có tài khoản?{" "}
          <a
            href="/register"
            className="text-indigo-600 font-medium hover:underline"
          >
            Đăng ký ngay
          </a>
        </p>
      </div>
    <div className="card p-3 shadow" style={{ maxWidth: 420 }}>
      <h3 className="mb-3">Đăng nhập</h3>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-3"
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button 
          className="btn btn-primary w-100" 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default LoginForm;