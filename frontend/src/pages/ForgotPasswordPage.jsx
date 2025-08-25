import React, { useState } from "react";
import ForgotPasswordRequestForm from "../components/ForgotPasswordRequestForm";
import ResetPasswordForm from "../components/ResetPasswordForm";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState("request"); // request | reset
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleOtpSent = (e) => {
    setEmail(e);
    setStep("reset");
  };

  const handleResetSuccess = () => {
    navigate("/login");
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      {step === "request" && <ForgotPasswordRequestForm onOtpSent={handleOtpSent} />}
      {step === "reset" && <ResetPasswordForm email={email} onSuccess={handleResetSuccess} />}
    </div>
  );
};

export default ForgotPasswordPage;
