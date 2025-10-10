// src/components/AvatarUploader.jsx
import React, { useEffect, useState } from "react";

const PLACEHOLDER = "anon-1756225814890-bdf366938b95.png"; // bạn có thể thêm file tĩnh

/**
 * Props:
 * - src (string) : current avatar full url (nullable)
 * - onFileSelect(file) : callback khi chọn file (File)
 * - onRemove() : callback khi người dùng nhấn xóa avatar
 */
export default function AvatarUploader({ src, onFileSelect, onRemove }) {
  const [preview, setPreview] = useState(src || null);

  useEffect(() => {
    setPreview(src || null);
  }, [src]);

  // khi người dùng chọn file -> tạo preview local
  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview(url);
    onFileSelect && onFileSelect(f);
  };

  const hiddenInputId = "avatar-input-" + Math.random().toString(36).slice(2, 8);

  return (
    <div className="flex items-center gap-4">
      {/* Avatar Preview */}
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
        <img
          src={preview || PLACEHOLDER}
          alt="avatar"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor={hiddenInputId}
          className="cursor-pointer bg-blue-500 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-600 transition text-center"
        >
          Chọn ảnh
        </label>
        <input
          id={hiddenInputId}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          className="bg-red-500 text-white px-4 py-2 text-sm rounded-md hover:bg-red-600 transition"
          onClick={onRemove}
        >
          Xóa
        </button>
      </div>
    </div>
  );
}