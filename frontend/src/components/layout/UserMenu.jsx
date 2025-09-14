import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../../src/store/authSlice";
import { SERVER_BASE } from "../../../src/config";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutThunk } from '../../../src/store/authThunks';
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
      localStorage.clear();
      toast.success("Đăng xuất thành công");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  return (
    <div className="position-relative" ref={ref}>
      <button
        type="button"
        className="btn btn-light d-flex align-items-center"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {/* Avatar nhỏ + tên */}
        <div
          className="me-2 d-flex align-items-center justify-content-center bg-secondary text-white"
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: "50%",
            overflow: "hidden",
            fontSize: 12,
          }}
        >
          {avatar ? (
            <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (<span>{user.name || user.email}</span>)}
        </div>
        <span className="me-1">{user.name || user.email}</span>
        <span className="ms-1" aria-hidden>▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="card shadow position-absolute"
          style={{ right: 0, top: "110%", minWidth: 220, zIndex: 1000 }}
        >
          <div className="list-group list-group-flush">
            <Link to="/profile" className="list-group-item list-group-item-action" onClick={close}>
              Profile
            </Link>
            <Link to="/orders" className="list-group-item list-group-item-action" onClick={close}>
              Đơn hàng của tôi
            </Link>
            <button
              className="list-group-item list-group-item-action text-danger"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
