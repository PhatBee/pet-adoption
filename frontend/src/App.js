import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import './index.css';   //import Tailwind CSS
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from "./components/test/ProfilePage";
import Header from './components/layout/header';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import Navbar from './components/test/Navbar';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminOrderPage from './pages/AdminOrderPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProductSnapshotDetail from './pages/ProductSnapshotDetailPage';
import ErrorPage from './pages/ErrorPage'; // 1. Import trang lỗi
import AdminRoute from './components/admin/AdminRoute';

import ProfileLayout from './pages/ProfileLayout';
import ProfileForm from './pages/ProfileForm'; // Component này giờ sẽ là một route con
import AddressListPage from './pages/AddressListPage';
import SecurityPage from './pages/SecurityPage';

import WishlistPage from './pages/WishlistPage';
import { fetchWishlist } from "./store/wishlistSlice"
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { refreshSessionThunk } from './store/authThunks';


function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Gọi thunk để kiểm tra phiên đăng nhập khi App được render lần đầu
    dispatch(refreshSessionThunk());
  }, [dispatch]);

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [user, dispatch]);



  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          {/* <Route path="*" element={<Dashboard />} /> */}

          {/* 2. Thay thế route profile cũ bằng cấu trúc lồng nhau này */}
          <Route path="/profile" element={<ProfileLayout />}>
            {/* Route con cho trang thông tin cá nhân (hiển thị mặc định) */}
            <Route index element={<ProfileForm />} />

            {/* Route con cho trang sổ địa chỉ */}
            <Route path="addresses" element={<AddressListPage />} />

             {/* 2. Thêm route con mới cho trang bảo mật */}
            <Route path="security" element={<SecurityPage />} />

          </Route>
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/orders/:orderId/item/:productId/snapshot" element={<ProductSnapshotDetail />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />

        {/* 2. Bọc route admin bằng AdminRoute */}
          <Route 
            path="/admin/orders" 
            element={
              <AdminRoute>
                <AdminOrderPage />
              </AdminRoute>
            } 
          />

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter >
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
