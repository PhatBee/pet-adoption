import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheckDouble } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import TimeAgo from 'react-timeago'; // Cài đặt: npm install react-timeago
import vietnameseStrings from 'react-timeago/lib/language-strings/vi';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/authSlice';

const formatter = buildFormatter(vietnameseStrings);

function NotificationItem({ notification, onRead }) {
    const handleClick = () => {
        if (!notification.isRead) {
            onRead(notification._id);
        }
    };

    return (
        <Link
            to={notification.link || '#'}
            onClick={handleClick}
            className={`block px-4 py-3 hover:bg-gray-100 border-b last:border-b-0 ${notification.isRead ? 'opacity-70' : 'font-semibold'}`}
        >
            <p className="text-sm text-gray-800 mb-1">{notification.title}</p>
            <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
            <p className="text-xs text-blue-500">
                <TimeAgo date={notification.createdAt} formatter={formatter} />
            </p>
        </Link>
    );
}

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const bellRef = useRef(null);

    const toggleDropdown = () => setIsOpen(prev => !prev);
    const closeDropdown = () => setIsOpen(false);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bellRef.current && !bellRef.current.contains(event.target)) {
                closeDropdown();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!useSelector(selectUser)) { // Chỉ hiển thị khi đã đăng nhập
        return null;
    }

    return (
        <div className="relative" ref={bellRef}>
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full focus:outline-none"
                aria-label="Notifications"
            >
                <FaBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50 overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-2 border-b">
                        <h3 className="text-md font-semibold text-gray-800">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => { markAllAsRead(); closeDropdown(); }}
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                                <FaCheckDouble /> Đánh dấu đã đọc tất cả
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="text-center text-gray-500 py-6">Không có thông báo nào.</p>
                        ) : (
                            notifications.map(noti => (
                                <NotificationItem
                                    key={noti._id}
                                    notification={noti}
                                    onRead={() => { markAsRead(noti._id); closeDropdown(); }}
                                />
                            ))
                        )}
                    </div>
                     <div className="px-4 py-2 border-t text-center bg-gray-50">
                        {/* Link đến trang xem tất cả thông báo (nếu có) */}
                        {/* <Link to="/notifications" onClick={closeDropdown} className="text-sm text-blue-600 hover:underline">Xem tất cả</Link> */}
                    </div>
                </div>
            )}
        </div>
    );
}