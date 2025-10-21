import React, { useState } from "react";
import RegisterForm from "../components/RegisterForm";
import OtpForm from "../components/OtpForm";
import AuthModal from "../components/AuthModal";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [step, setStep] = useState("register"); // "register" | "otp"
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleRegisterSuccess = (userEmail) => {
    setEmail(userEmail);
    setStep("otp");
  };

  // 💥 THÊM HÀM XỬ LÝ KHI XÁC THỰC OTP THÀNH CÔNG
  const handleOtpSuccess = () => {
    navigate("/login"); // Điều hướng đến trang Đăng nhập
  }

  return (
    <AuthModal onClose={() => navigate("/")}>
      {step === "register" && (
        <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
      )}
      {step === "otp" && <OtpForm email={email} onOtpSuccess={handleOtpSuccess} />}
    </AuthModal>
  );
};

export default RegisterPage;
