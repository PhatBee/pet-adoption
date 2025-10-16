import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/authSlice';
import { Navigate } from 'react-router-dom';
import StatsTable from '../components/admin/StatsTable';
import SalesChart from '../components/admin/SalesChart';
import AdminSidebar from '../components/admin/AdminSideBar';


const Dashboard = () => {
  const user = useSelector(selectUser);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard quản trị</h1>
        <StatsTable />
        <SalesChart />
      </main>
    </div>
  );
};

export default Dashboard;