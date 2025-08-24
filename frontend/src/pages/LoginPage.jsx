import React from "react";
import LoginForm from "../components/LoginForm";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  return (
    <div className="container mt-5 d-flex justify-content-center">
      <LoginForm onSuccess={() => navigate("/dashboard")} />
    </div>
  );
};

export default LoginPage;
