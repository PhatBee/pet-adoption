import React, { useState } from "react";
import { resetPasswordApi } from "../api/authApi";
import { toast } from "react-toastify";

const strongEnough = (pwd) =>
  pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd);

const ResetPasswordForm = ({ email, onSuccess }) => {
  const [otp, setOtp] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pwd !== confirm) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    // if (!strongEnough(pwd)) {
    //   toast.error("Mật khẩu phải ≥ 8 ký tự và có chữ hoa, chữ thường, số");
    //   return;
    // }
    setSubmitting(true);
    try {
      await resetPasswordApi({ email, otp: otp.trim(), newPassword: pwd });
      toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message || "Đặt lại mật khẩu thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Giới hạn OTP chỉ số & 6 ký tự (tuỳ backend)
  const handleOtpChange = (v) => {
    const digitsOnly = v.replace(/\D/g, "").slice(0, 6);
    setOtp(digitsOnly);
  };

  return (
    <div className="card p-3 shadow" style={{ maxWidth: 420 }}>
      <h4 className="mb-1">Nhập OTP & mật khẩu mới</h4>
      <p className="text-muted">Gửi tới: <strong>{email}</strong></p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          inputMode="numeric"
          className="form-control mb-3"
          placeholder="OTP 6 số"
          value={otp}
          onChange={(e) => handleOtpChange(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-control mb-2"
          placeholder="Mật khẩu mới"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Xác nhận mật khẩu mới"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button className="btn btn-success w-100" type="submit" disabled={submitting}>
          {submitting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
