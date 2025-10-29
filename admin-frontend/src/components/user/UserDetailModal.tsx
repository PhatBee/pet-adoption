// src/components/user/UserDetailModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal'; // Use your existing Modal component
import userApi from '../../store/api/userApi';
import { User } from '../../types/next';
import { toast } from 'react-toastify';
import UserDetailView from './UserDetailView';

interface UserDetailModalProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ userId, isOpen, onClose }) => {
    const [userData, setUserData] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            const fetchUser = async () => {
                setIsLoading(true);
                try {
                    const data = await userApi.getUserById(userId);
                    setUserData(data);
                } catch (error) {
                    toast.error('Không thể tải chi tiết người dùng.');
                    console.error("Fetch user detail error:", error);
                    onClose();
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUser();
        } else {
             setUserData(null);
        }
    }, [isOpen, userId, onClose]);

    const title = isLoading ? 'Đang tải...' : userData ? `Chi tiết: ${userData.name}` : 'Lỗi';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="max"
        >
            {isLoading && <p className="text-center text-indigo-600 py-8">Đang tải dữ liệu...</p>}
            {!isLoading && userData && <UserDetailView user={userData} />}
            {!isLoading && !userData && <p className="text-center text-red-500 py-8">Không thể tải dữ liệu người dùng.</p>}
        </Modal>
    );
};

export default UserDetailModal;