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
import ProfilePage from "./pages/ProfilePage";



function App() {

  // return (
  //   <>
  //     <RegisterPage />
  //     {/* ToastContainer phải nằm trong App để toast hiển thị ở mọi nơi */}
  //     <ToastContainer position="top-right" autoClose={3000} />
  //   </>
  // );

   return (
      <>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="*" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
      </>
  );
}

export default App;
