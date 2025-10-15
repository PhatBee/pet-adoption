import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { deleteAccountApi } from '../../api/userApi';
import { logoutThunk } from '../../store/authThunks';
import { motion, AnimatePresence } from "framer-motion";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function DeleteAccount() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleDeleteConfirmed = async () => {
        setIsDeleting(true);
        try {
            const response = await deleteAccountApi();
            toast.success(response.data.message || "Tài khoản đã được xóa.");
            await dispatch(logoutThunk());
            navigate("/");
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa tài khoản.");
        } finally {
            setIsDeleting(false);
            setShowModal(false);
        }
    };

    return (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6 mt-8">
            <h3 className="text-xl font-bold text-red-800">Vùng nguy hiểm</h3>
            <p className="mt-2 text-red-700">
                Khi bạn xóa tài khoản, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </p>
            <div className="mt-4">
                <button
                    onClick={() => setShowModal(true)}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition disabled:opacity-50"
                >
                    {isDeleting ? "Đang xóa..." : "Xóa tài khoản của tôi"}
                </button>
            </div>

            {/* Modal xác nhận */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center 
             bg-gradient-to-br from-black/60 to-red-800/40 
             backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full border-t-4 border-red-600"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="flex items-center">
                                <ExclamationTriangleIcon className="h-10 w-10 text-red-600 mr-3" />
                                <h2 className="text-xl font-bold text-red-700">Xác nhận xóa tài khoản</h2>
                            </div>

                            <p className="mt-4 text-gray-700 leading-relaxed">
                                Hành động này <span className="font-semibold text-red-600">không thể hoàn tác</span>.
                                Tất cả dữ liệu của bạn (đơn hàng, địa chỉ, thông tin cá nhân) sẽ bị xóa vĩnh viễn.
                                Bạn có chắc chắn muốn tiếp tục không?
                            </p>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                                >
                                    Hủy
                                </button>
                                <motion.button
                                    onClick={handleDeleteConfirmed}
                                    disabled={isDeleting}
                                    whileTap={{ scale: 0.95 }}
                                    whileHover={{ scale: 1.05 }}
                                    className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold
             hover:bg-red-700 shadow-md flex items-center justify-center
             min-w-[150px] transition disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <div className="flex items-center">
                                            <svg
                                                className="animate-spin h-5 w-5 mr-2 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                ></path>
                                            </svg>
                                            Đang xóa...
                                        </div>
                                    ) : (
                                        "Xác nhận xóa"
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
