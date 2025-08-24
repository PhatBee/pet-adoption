import React, { useState } from "react";
import RegisterForm from "../components/RegisterForm";
import OtpForm from "../components/OtpForm";

const RegisterPage = () => {
  const [step, setStep] = useState("register"); // "register" hoặc "otp"
  const [email, setEmail] = useState("");

  const handleRegisterSuccess = (userEmail) => {
    setEmail(userEmail);
    setStep("otp");
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      {step === "register" && (
        <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
      )}
      {step === "otp" && <OtpForm email={email} />}
    </div>
  );
};

export default RegisterPage;
