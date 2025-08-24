import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const LoginForm = ({ onSuccess }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(data.message || "Đăng nhập thành công");
      onSuccess?.(data.user);
    } catch (error) {
      const msg = error.response?.data?.message || "Đăng nhập thất bại";
      console.log("message:", msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
        <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
          {submitting ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
