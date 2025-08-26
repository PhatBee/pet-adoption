import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import LoginForm from "../components/LoginForm";
import { loginThunk } from '../store/authThunks';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(state => state.auth.loading);

  const handleSubmit = async (credentials) => {
    try {
      const result = await dispatch(loginThunk(credentials));
      if (loginThunk.fulfilled.match(result)) {
        toast.success('Đăng nhập thành công!');
        navigate('/dashboard');
      } else if (loginThunk.rejected.match(result)) {
        toast.error(result.payload || 'Đăng nhập thất bại');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <LoginForm 
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LoginPage;