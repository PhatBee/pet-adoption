import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
// 1. Import icons from react-icons
import { FaUserCircle, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';

export default function ProfileLayout() {
  const getNavLinkClass = ({ isActive }) => {
    // 2. Add base classes for icons and transitions
    const baseClasses = 'flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 no-underline';
    
    return isActive
      ? `${baseClasses} bg-blue-100 text-blue-700 font-semibold`
      : `${baseClasses} text-gray-600 hover:bg-gray-100 hover:text-gray-900`;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Tài khoản của bạn</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <aside className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200">
              <nav className="space-y-2">
                {/* 3. Add icons to your NavLinks */}
                <NavLink to="/profile" end className={getNavLinkClass}>
                  <FaUserCircle size={20} />
                  <span>Thông tin cá nhân</span>
                </NavLink>
                <NavLink to="/profile/addresses" className={getNavLinkClass}>
                  <FaMapMarkerAlt size={20} />
                  <span>Sổ địa chỉ</span>
                </NavLink>
                {/* 2. Thêm NavLink mới cho trang bảo mật */}
                <NavLink to="/profile/security" className={getNavLinkClass}>
                  <FaShieldAlt size={20} />
                  <span>Bảo mật</span>
                </NavLink>
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  );
}