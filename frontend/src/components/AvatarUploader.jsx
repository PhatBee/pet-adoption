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
    <div className="d-flex align-items-center">
      <div style={{ width: 96, height: 96, borderRadius: 8, overflow: "hidden", border: "1px solid #ddd" }}>
        <img
          src={preview || PLACEHOLDER}
          alt="avatar"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div className="ms-3">
        <label className="btn btn-outline-primary btn-sm me-2" htmlFor={hiddenInputId} style={{ cursor: "pointer" }}>
          Chọn ảnh
        </label>
        <input
          id={hiddenInputId}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button type="button" className="btn btn-outline-danger btn-sm" onClick={onRemove}>
          Xóa
        </button>
      </div>
    </div>
  );
}
