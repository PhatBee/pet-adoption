import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../../src/store/authSlice";
import { SERVER_BASE } from "../../../src/config";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutThunk } from '../../../src/store/authThunks';
import { persistor } from '../../../src/store/store'; // ✅ Thêm dòng này

import { toast } from 'react-toastify';

const AVATAR_SIZE = 32;

export default function UserMenu() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const toggle = () => setOpen((s) => !s);
  const close = () => setOpen(false);

  // đóng menu khi click ra ngoài
  useEffect(() => {
    const handle = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (!user) return null;

  // ghép avatar url nếu server trả đường dẫn tương đối
  const avatar = user.avatarUrl
    ? (user.avatarUrl.startsWith("http") ? user.avatarUrl : SERVER_BASE + user.avatarUrl)
    : null;

  // 🟢 handleLogout
  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      await persistor.purge();
      
      localStorage.clear();
      toast.success("Đăng xuất thành công");

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        className="flex items-center px-2 py-1 rounded-lg hover:bg-gray-100"
      >
        <div
          className="flex items-center justify-center bg-gray-400 text-white rounded-full mr-2"
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, fontSize: 12 }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt="avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span>{user.name?.charAt(0) || user.email?.charAt(0)}</span>
          )}
        </div>
        <span className="text-sm font-medium">{user.name || user.email}</span>
        <span className="ml-1 text-gray-500">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg border z-50 no-underline">
          <Link
            to="/cart"
            onClick={close}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 no-underline"
          >
            Giỏ hàng
          </Link>
          
          <Link
            to="/profile"
            onClick={close}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 no-underline"
          >
            Profile
          </Link>
          <Link
            to="/orders"
            onClick={close}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 no-underline"
          >
            Đơn hàng của tôi
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 no-underline"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}