import React, { useState } from "react";
import { registerApi } from "../api/authApi";
import { toast } from "react-toastify";


const RegisterForm = ({ onRegisterSuccess }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  // const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerApi(form);
      toast.success(res.data.message);
      onRegisterSuccess(form.email); // chuyển sang OTP step
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="card p-3 shadow">
      <h3 className="mb-3">Đăng ký tài khoản</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Họ tên"
          className="form-control mb-2"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="form-control mb-2"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          className="form-control mb-2"
          onChange={handleChange}
          required
        />
        <button className="btn btn-primary w-100" type="submit">
          Đăng ký
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
