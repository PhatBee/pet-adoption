import React from 'react';
import type { ReactElement, ReactNode } from 'react';
import AdminLayout from '../../components/AdminLayout';
import type { NextPageWithLayout } from '../../types/next';
import SalesChart from '../../components/sale/AdminSalesChart';

const DashboardPage: NextPageWithLayout = () => {
  // Logic lấy data cho dashboard (nếu cần) có thể dùng SWR hoặc useEffect

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Chào mừng trở lại, Admin!
      </h1>
      
      <SalesChart />
    </>
  );
};

// **PHẦN QUAN TRỌNG NHẤT**
// Áp dụng AdminLayout cho trang này
DashboardPage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default DashboardPage;