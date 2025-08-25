import React, { useState } from "react";
import { requestResetOtpApi } from "../api/authApi";
import { toast } from "react-toastify";

const ForgotPasswordRequestForm = ({ onOtpSent }) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await requestResetOtpApi(email.trim().toLowerCase());
      toast.success("Nếu email hợp lệ, OTP đã được gửi. Vui lòng kiểm tra hộp thư.");
      onOtpSent?.(email.trim().toLowerCase());
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể gửi OTP";
      toast.error(msg);
      // Nếu server trả còn bao nhiêu giây, bạn có thể parse và set vào start()

    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setSubmitting(true);
    try {
      await requestResetOtpApi(email.trim().toLowerCase());
      toast.info("OTP mới đã được gửi.");
    } catch (err) {
      const msg = err.response?.data?.message || "Gửi lại OTP thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-3 shadow" style={{ maxWidth: 420 }}>
      <h4 className="mb-3">Quên mật khẩu</h4>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          className="form-control mb-3"
          placeholder="Nhập email đã đăng ký"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
          {submitting ? "Đang gửi..." : "Gửi OTP"}
        </button>
      </form>

      <button
        className="btn btn-link mt-2"
        type="button"
        onClick={handleResend}
        disabled={submitting || !email}
        title={!email ? "Nhập email trước" : ""}
      >
      </button>
    </div>
  );
};

export default ForgotPasswordRequestForm;
