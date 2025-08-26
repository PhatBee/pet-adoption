import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutThunk } from '../store/authThunks';
import { toast } from 'react-toastify';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      // Clear local storage nếu bạn có lưu gì đó
      localStorage.clear();
      toast.success('Đăng xuất thành công');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  return (
    <button 
      className="btn btn-danger" 
      onClick={handleLogout}
    >
      Đăng xuất
    </button>
  );
};

export default LogoutButton;