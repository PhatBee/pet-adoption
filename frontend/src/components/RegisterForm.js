import React, { useState } from "react";
import { registerApi } from "../api/authApi";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const RegisterForm = ({ onRegisterSuccess }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerApi(form);
      toast.success(res.data.message || "Đăng ký thành công!");
      onRegisterSuccess(form.email);
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Title */}
      <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
        Đăng ký
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Họ và tên */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-600">
            Họ và tên
          </label>
          <input
            type="text"
            name="name"
            placeholder="Nhập họ và tên"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Nhập email của bạn"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onChange={handleChange}
            required
          />
        </div>

        {/* Mật khẩu */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-600">
            Mật khẩu
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onChange={handleChange}
            required
          />
        </div>

        {/* Nút submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 
                     text-white font-medium rounded-lg shadow-sm transition 
                     disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500 mt-4">
        Đã có tài khoản?{" "}
        <a
          href="/login"
          className="text-indigo-600 font-medium hover:underline"
        >
          Đăng nhập
        </a>
      </p>
    </div>
  );
};

export default RegisterForm;
