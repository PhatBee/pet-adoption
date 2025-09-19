// src/components/AddressSelector.jsx
import React, { useState } from "react";

/**
 * Props:
 * - addresses: array from backend
 * - value: currently selected address object or null
 * - onChange(addressObj)
 */
export default function AddressSelector({ addresses = [], value, onChange }) {
  const [useNew, setUseNew] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", street: "", ward: "", district: "", city: "" });

  const handleSelect = (addr) => {
    setUseNew(false);
    onChange(addr);
  };

  const handleNewToggle = () => {
    setUseNew((s) => !s);
    if (!useNew) onChange(null);
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submitNew = () => {
    // validate minimal
    if (!form.fullName || !form.phone || !form.street || !form.city) {
      return alert("Vui lòng điền tên, điện thoại, đường, thành phố");
    }
    onChange(form);
  };

  return (
    <div>
      <h4 className="font-semibold mb-2">Chọn địa chỉ giao hàng</h4>

      {addresses.length > 0 && (
        <div className="space-y-2 mb-2">
          {addresses.map((addr, i) => (
            <label key={i} className={`block border rounded p-3 ${value === addr ? "border-blue-500" : "border-gray-200"}`}>
              <input
                type="radio"
                name="addr"
                className="mr-2"
                onChange={() => handleSelect(addr)}
                checked={value === addr}
              />
              <span className="font-semibold">{addr.fullName}</span> — {addr.phone}
              <div className="text-sm text-gray-600 mt-1">{addr.street}, {addr.ward ? addr.ward + ", " : ""}{addr.district ? addr.district + ", " : ""}{addr.city}</div>
            </label>
          ))}
        </div>
      )}

      <div className="mb-2">
        <button className="text-sm text-blue-600 underline" type="button" onClick={handleNewToggle}>
          {useNew ? "Sử dụng địa chỉ có sẵn" : "Thêm địa chỉ mới"}
        </button>
      </div>

      {useNew && (
        <div className="border p-3 rounded space-y-2">
          <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Họ tên" className="w-full p-2 border rounded" />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Số điện thoại" className="w-full p-2 border rounded" />
          <input name="street" value={form.street} onChange={handleChange} placeholder="Số nhà, tên đường" className="w-full p-2 border rounded" />
          <input name="ward" value={form.ward} onChange={handleChange} placeholder="Phường/Xã" className="w-full p-2 border rounded" />
          <input name="district" value={form.district} onChange={handleChange} placeholder="Quận/Huyện" className="w-full p-2 border rounded" />
          <input name="city" value={form.city} onChange={handleChange} placeholder="Tỉnh/Thành phố" className="w-full p-2 border rounded" />
          <div className="flex gap-2">
            <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded" onClick={submitNew}>Sử dụng địa chỉ này</button>
            <button type="button" className="border px-4 py-2 rounded" onClick={()=>{ setUseNew(false); }}>Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
}
