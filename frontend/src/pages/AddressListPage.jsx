import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, updateUser } from '../store/authSlice';
import AddressCard from '../components/user/AddressCard';
import AddressModal from '../components/user/AddressModal';
import AddressForm from '../components/user/AddressForm';
import { addAddressApi, updateAddressApi } from '../api/userApi';
import { toast } from 'react-toastify';

export default function AddressListPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const addresses = user?.addresses || [];

  // --- 1. THÊM STATE ĐỂ QUẢN LÝ MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State để lưu địa chỉ đang được sửa. Nếu là `null`, modal sẽ ở chế độ "thêm mới".
  const [editingAddress, setEditingAddress] = useState(null);

  // --- 2. CẬP NHẬT CÁC HÀM XỬ LÝ SỰ KIỆN ---
  const handleOpenAddModal = () => {
    setEditingAddress(null); // Xóa địa chỉ đang sửa (nếu có)
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // --- 3. TẠO HÀM SUBMIT FORM ---
  const handleFormSubmit = async (formData) => {
    try {
      let response;
      if (editingAddress) {
        // Chế độ sửa
        response = await updateAddressApi(editingAddress._id, formData);
        toast.success("Cập nhật địa chỉ thành công!");
      } else {
        // Chế độ thêm mới
        response = await addAddressApi(formData);
        toast.success("Thêm địa chỉ mới thành công!");
      }
      
      // Cập nhật lại Redux store với danh sách địa chỉ mới
      dispatch(updateUser({ addresses: response.data.addresses }));
      handleCloseModal();

    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra.");
    }
  };

  const handleDelete = (addressId) => {
    // TODO
    toast.warning(`Xóa địa chỉ ID: ${addressId}`);
  };

  const handleSetDefault = (addressId) => {
    // TODO
    toast.success(`Đặt làm mặc định ID: ${addressId}`);
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Sổ địa chỉ của bạn</h2>
          {/* Thay Link bằng button để mở modal */}
          <button 
            onClick={handleOpenAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            Thêm địa chỉ mới
          </button>
        </div>
        
        {addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <AddressCard 
                key={addr._id}
                address={addr}
                onEdit={handleOpenEditModal} // Gắn hàm mở modal sửa
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Bạn chưa có địa chỉ nào được lưu.</p>
          </div>
        )}
      </div>

      {/* --- 4. RENDER MODAL --- */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
      >
        <AddressForm
          initialData={editingAddress}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
        />
      </AddressModal>
    </>
  );
}