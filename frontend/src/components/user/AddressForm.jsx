import React, { useState, useEffect } from 'react';

export default function AddressForm({ initialData = null, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false,
  });

  // This effect runs when the component loads.
  // If we pass `initialData` (an existing address), it populates the form for editing.
  useEffect(() => {
    if (initialData) {
      setForm({
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        street: initialData.street || '',
        ward: initialData.ward || '',
        district: initialData.district || '',
        city: initialData.city || '',
        isDefault: initialData.isDefault || false,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple validation
    if (!form.fullName || !form.phone || !form.street || !form.city) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
          <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
      </div>
      
      {/* City, District, Ward */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
        <input type="text" name="city" value={form.city} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Quận/Huyện</label>
        <input type="text" name="district" value={form.district} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phường/Xã</label>
        <input type="text" name="ward" value={form.ward} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>

      {/* Street Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Số nhà, tên đường</label>
        <input type="text" name="street" value={form.street} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
      </div>

      {/* Is Default Checkbox */}
      <div className="flex items-center">
        <input id="isDefault" type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">Đặt làm địa chỉ mặc định</label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Hủy</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Đang lưu...' : 'Lưu địa chỉ'}
        </button>
      </div>
    </form>
  );
}