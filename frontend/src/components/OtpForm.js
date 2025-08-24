import React, { useState } from "react";
import { verifyOtpApi, resendOtpApi } from "../api/authApi";
import { toast } from "react-toastify";

const OtpForm = ({ email }) => {
  const [otp, setOtp] = useState("");
  // const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await verifyOtpApi({ email, otp });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Xác thực thất bại");
    }
  };

  const handleResend = async () => {
    try {
      const res = await resendOtpApi({ email });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gửi lại OTP thất bại");
    }
  };

  return (
    <div className="card p-3 shadow">
      <h3 className="mb-3">Xác thực OTP</h3>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Nhập OTP"
          className="form-control mb-2"
          required
        />
        <button className="btn btn-success w-100 mb-2" type="submit">
          Xác thực
        </button>
      </form>
      <button className="btn btn-link" onClick={handleResend}>
        Gửi lại OTP
      </button>
    </div>
  );
};

export default OtpForm;
