import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../../src/store/authSlice";
import UserMenu from "./UserMenu";

export default function Header() {
  const user = useSelector(selectUser);

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="text-indigo-600 font-bold text-lg no-underline">
          🐾 Pet Store
        </Link>

        <nav className="flex items-center gap-5">
          <Link
            to="/promotions"
            className="text-gray-700 hover:text-indigo-600 no-underline"
          >
            Khuyến mãi
          </Link>
          <Link
            to="/wishlist"
            className="text-gray-700 hover:text-indigo-600 no-underline"
          >
            Yêu thích
          </Link>
          <Link
            to="/products"
            className="text-gray-700 hover:text-indigo-600 no-underline"
          >
            Sản phẩm
          </Link>
          <Link
            to="/pets"
            className="text-gray-700 hover:text-indigo-600 no-underline"
          >
            Thú cưng
          </Link>
          <Link
            to="/about"
            className="text-gray-700 hover:text-indigo-600 no-underline"
          >
            Giới thiệu
          </Link>
          {user ? (
            <UserMenu />
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="px-3 py-1 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 text-sm no-underline"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm no-underline"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}