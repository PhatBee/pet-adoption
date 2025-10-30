import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 1. Import axios

// 2. Định nghĩa API URL
const PROVINCE_API_URL = "https://provinces.open-api.vn/api/v1";

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

  // --- 3. State để lưu danh sách Tỉnh/Huyện/Xã ---
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // --- 4. State để theo dõi loading ---
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // --- 5. Tải danh sách Tỉnh/Thành phố khi component mount ---
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const res = await axios.get(`${PROVINCE_API_URL}/p/`, { withCredentials: false });
        setProvinces(res.data);
      } catch (error) {
        console.error("Lỗi tải Tỉnh/TP:", error);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // --- 6. Tải danh sách Quận/Huyện khi Tỉnh/TP thay đổi ---
  useEffect(() => {
    // Chỉ chạy khi `form.city` (tên tỉnh) và danh sách `provinces` đã sẵn sàng
    if (form.city && provinces.length > 0) {
      const selectedProvince = provinces.find(p => p.name === form.city);
      if (selectedProvince) {
        const fetchDistricts = async () => {
          setLoadingDistricts(true);
          try {
            const res = await axios.get(`${PROVINCE_API_URL}/p/${selectedProvince.code}?depth=2`, {withCredentials: false});
            setDistricts(res.data.districts);
          } catch (error) {
            console.error("Lỗi tải Quận/Huyện:", error);
          } finally {
            setLoadingDistricts(false);
          }
        };
        fetchDistricts();
      }
    } else {
      // Nếu không có tỉnh nào được chọn (hoặc reset), xóa danh sách Huyện
      setDistricts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.city, provinces]); // Chạy lại khi `form.city` hoặc `provinces` thay đổi

  // --- 7. Tải danh sách Phường/Xã khi Quận/Huyện thay đổi ---
  useEffect(() => {
    if (form.district && districts.length > 0) {
      const selectedDistrict = districts.find(d => d.name === form.district);
      if (selectedDistrict) {
        const fetchWards = async () => {
          setLoadingWards(true);
          try {
            const res = await axios.get(`${PROVINCE_API_URL}/d/${selectedDistrict.code}?depth=2`, {withCredentials: false });
            setWards(res.data.wards);
          } catch (error) {
            console.error("Lỗi tải Phường/Xã:", error);
          } finally {
            setLoadingWards(false);
          }
        };
        fetchWards();
      }
    } else {
      setWards([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.district, districts]); // Chạy lại khi `form.district` hoặc `districts` thay đổi



  // This effect runs when the component loads.
  // If we pass `initialData` (an existing address), it populates the form for editing.
  // --- 8. Cập nhật form khi `initialData` (dữ liệu sửa) thay đổi ---
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
    } else {
      // Nếu là "thêm mới", reset form
      setForm({
        fullName: '', phone: '', street: '', ward: '', district: '', city: '', isDefault: false,
      });
    }
  }, [initialData]);

  // --- 9. Hàm xử lý thay đổi chung (cho Tên, SĐT, Số nhà) ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // --- 10. Hàm xử lý riêng cho Tỉnh/TP ---
  const handleProvinceChange = (e) => {
    const selectedCityName = e.target.value;
    setForm(prev => ({
      ...prev,
      city: selectedCityName,
      district: '', // Reset quận
      ward: '',     // Reset xã
    }));
    setDistricts([]); // Xóa danh sách quận cũ
    setWards([]);     // Xóa danh sách xã cũ
  };

  // --- 11. Hàm xử lý riêng cho Quận/Huyện ---
  const handleDistrictChange = (e) => {
    const selectedDistrictName = e.target.value;
    setForm(prev => ({
      ...prev,
      district: selectedDistrictName,
      ward: '',     // Reset xã
    }));
    setWards([]); // Xóa danh sách xã cũ
  };

  // --- 12. Hàm xử lý riêng cho Phường/Xã ---
  const handleWardChange = (e) => {
    setForm(prev => ({
      ...prev,
      ward: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.street || !form.city || !form.district || !form.ward) {
      // Cập nhật validation
      alert("Vui lòng điền đầy đủ thông tin Tên, SĐT, Tỉnh, Huyện, Xã và Số nhà.");
      return;
    }
    onSubmit(form);
  };

  // --- 13. Helper để render dropdown ---
  const renderSelect = (name, label, value, onChange, options, loading, disabled = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select 
        name={name} 
        value={value} 
        onChange={onChange} 
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white" 
        required
        disabled={loading || disabled}
      >
        <option value="">{loading ? `Đang tải ${label.toLowerCase()}...` : `Chọn ${label}`}</option>
        {options.map((item) => (
          <option key={item.code} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );

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
      {/* <div>
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
      </div> */}
      {/* --- 14. Thay thế Input bằng Select --- */}
      {renderSelect("city", "Tỉnh/Thành phố", form.city, handleProvinceChange, provinces, loadingProvinces)}
      
      {renderSelect("district", "Quận/Huyện", form.district, handleDistrictChange, districts, loadingDistricts, !form.city)}
      
      {renderSelect("ward", "Phường/Xã", form.ward, handleWardChange, wards, loadingWards, !form.district)}


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