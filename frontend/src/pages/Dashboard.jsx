import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="container mt-5">
      <h3>Xin chào, {user?.name || user?.email}</h3>
      <button className="btn btn-outline-danger mt-3" onClick={logout}>
        Đăng xuất
      </button>
    </div>
  );
};

export default Dashboard;
