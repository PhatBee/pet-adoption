import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/authSlice';
import { Navigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';


const Dashboard = () => {
  const user = useSelector(selectUser);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mt-4">
      <h2>Dashboard</h2>
      <LogoutButton />
      <div className="card p-4">
        <h3>Welcome, {user?.name || 'User'}!</h3>
        <div className="mt-3">
          <p><strong>Email:</strong> {user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;