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