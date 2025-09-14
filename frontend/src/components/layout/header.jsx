import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../../src/store/authSlice";
import UserMenu from "./UserMenu";

export default function Header() {
  const user = useSelector(selectUser);

  return (
    <header className="border-bottom">
      <div className="container d-flex align-items-center justify-content-between py-2">
        <Link to="/" className="text-decoration-none">
          <h1 className="h5 m-0">🐾 Pet Adoption</h1>
        </Link>

        <nav className="d-flex align-items-center gap-3">
          <Link to="/pets" className="text-decoration-none">Thú cưng</Link>
          <Link to="/about" className="text-decoration-none">Giới thiệu</Link>

          {user ? (
            <UserMenu />
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-outline-primary btn-sm">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
