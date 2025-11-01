"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  disableCoupon
} from '../../store/slices/adminCouponSlice';

import Modal from '../../components/common/Modal';
import Pagination, { PaginationProps } from '../../components/common/Pagination';
import CouponForm from '../../components/coupon/CouponForm';
import { Coupon, CreateCouponDto } from '../../types/next';
import { CouponFormSchema } from '../../libs/validations/coupon.schema';
import AdminLayout from '../../components/AdminLayout';

const CouponManagementPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const dispatch = useAppDispatch();
  const { coupons, pagination, loading, error } = useAppSelector(
    (state) => state.adminCoupons
  );

  useEffect(() => {
    dispatch(fetchCoupons({ page, limit })); //
  }, [dispatch, page, limit]);

  useEffect(() => {
    if (loading === 'failed' && error) {
      toast.error(error);
    }
  }, [loading, error]);

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (formData: CouponFormSchema) => {
    const dto = {
      ...formData,
      productIds: formData.productIds ? formData.productIds.split(',').map(id => id.trim()).filter(Boolean) : [],
    };

    let resultAction;
    if (editingCoupon) {
      resultAction = await dispatch(updateCoupon({ id: editingCoupon._id, dto }));
      if (updateCoupon.fulfilled.match(resultAction)) {
        toast.success('Cập nhật coupon thành công!');
      }
    } else {
      resultAction = await dispatch(createCoupon(dto as CreateCouponDto));
      if (createCoupon.fulfilled.match(resultAction)) {
        toast.success('Tạo coupon mới thành công!');
        if (page !== 1) setPage(1);
      }
    }

    if (createCoupon.fulfilled.match(resultAction) || updateCoupon.fulfilled.match(resultAction)) {
      handleCloseModal();
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Bạn có chắc muốn ${coupon.isActive ? 'VÔ HIỆU HÓA' : 'XÓA VĨNH VIỄN'} mã "${coupon.code}"?`)) {
      return;
    }

    if (coupon.isActive) {
      // --- Vô hiệu hóa ---
      const result = await dispatch(disableCoupon(coupon._id));
      if (disableCoupon.fulfilled.match(result)) {
        toast.success('Đã vô hiệu hóa coupon.');
      }
    } else {
      // --- Xóa vĩnh viễn ---
      const result = await dispatch(deleteCoupon(coupon._id));
      if (deleteCoupon.fulfilled.match(result)) {
        toast.success('Đã xóa vĩnh viễn coupon.');
      }
    }
  };

  const paginationData: PaginationProps['pagination'] = {
    totalItems: pagination?.totalItems || 0,
    totalPages: pagination?.totalPages || 1,
    currentPage: pagination?.currentPage || 1,
    limit: limit,
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Coupon</h1>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
        >
          + Thêm mới
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Mã</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Mô tả</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Giảm giá</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Hạn dùng</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading === 'pending' && (
              <tr><td colSpan={6} className="p-4 text-center">Đang tải...</td></tr>
            )}
            {loading !== 'pending' && coupons?.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">Không tìm thấy coupon nào.</td></tr>
            )}
            {loading !== 'pending' && coupons?.map((coupon) => (
              <tr key={coupon._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-4 text-sm font-medium text-gray-900">{coupon.code}</td>
                <td className="p-4 text-sm text-gray-700">{coupon.description
                  ? (coupon.description.length > 50
                    ? `${coupon.description.substring(0, 50)}...`
                    : coupon.description) : '...'}</td>
                <td className="p-4 text-sm text-gray-700">
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}% (Tối đa ${coupon.maxDiscountValue?.toLocaleString('vi-VN')}đ)`
                    : `${coupon.discountValue?.toLocaleString('vi-VN')}đ`}
                </td>
                <td className="p-4 text-sm text-gray-700">
                  {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('vi-VN') : 'Không hết hạn'}
                </td>
                <td className="p-4 text-sm">
                  {coupon.isActive ? (
                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Kích hoạt</span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Vô hiệu hóa</span>
                  )}
                </td>
                <td className="p-4 text-sm space-x-2">
                  <button onClick={() => handleOpenEditModal(coupon)} className="text-indigo-600 hover:text-indigo-900">Sửa</button>
                  <button onClick={() => handleDelete(coupon)} className="text-red-600 hover:text-red-900">
                    {coupon.isActive ? 'Vô hiệu hóa' : 'Xóa'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          pagination={paginationData}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCoupon ? 'Cập nhật Coupon' : 'Tạo Coupon mới'}
        size="max"
      >
        <CouponForm
          defaultValues={editingCoupon as any}
          onSubmit={handleSubmit}
          isLoading={loading === 'pending'}
        />
      </Modal>
    </div>
  );
};

CouponManagementPage.getLayout = function getLayout(page: React.ReactElement) {
    return (
        <AdminLayout>{page}</AdminLayout>
    );
};

export default CouponManagementPage;