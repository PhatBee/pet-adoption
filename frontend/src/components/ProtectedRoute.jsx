import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthed, loading } = useAuth();
  if (loading) return <div className="p-4">Đang tải...</div>;
  if (!isAuthed) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
