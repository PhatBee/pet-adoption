// src/components/Navbar.jsx
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useState } from "react";
import { selectUser, clearCredentials } from "../../store/authSlice";

export default function Navbar() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    dispatch(clearCredentials());
    window.location.href = "/"; // quay về home
  };

  return (
    <div className="flex justify-between items-center px-6 py-3 bg-white shadow relative">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold text-blue-600">
        Pet Adoption
      </Link>

      {/* Nếu đã đăng nhập */}
      {user ? (
        <div className="relative">
          <span
            onClick={() => setOpen(!open)}
            className="cursor-pointer font-medium text-gray-700"
          >
            {user.name}
          </span>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
              <Link
                to="/profile"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/orders"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Đơn hàng của tôi
              </Link>
              <hr className="my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Nếu chưa đăng nhập */
        <div className="flex gap-4">
          <Link to="/login" className="text-gray-700 hover:text-blue-600">
            Login
          </Link>
          <Link to="/register" className="text-gray-700 hover:text-blue-600">
            Register
          </Link>
        </div>
      )}
    </div>
  );
}
