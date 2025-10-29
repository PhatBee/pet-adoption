import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/authSlice'; //
import { toast } from 'react-toastify';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

// URL của server backend (cổng 5000)
const SERVER_URL = process.env.REACT_APP_BASE || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const user = useSelector(selectUser); //
    const accessToken = useSelector((state) => state.auth.accessToken); // Lấy accessToken từ Redux

    // Hàm kết nối socket
    const connectSocket = useCallback(() => {
        if (user && accessToken && !socket) {
            console.log("Attempting to connect socket...");
            const newSocket = io(SERVER_URL, {
                // Gửi token qua `auth` để middleware backend xác thực
                auth: { token: accessToken },
                reconnectionAttempts: 5, // Thử kết nối lại 5 lần
                reconnectionDelay: 3000, // Chờ 3s giữa các lần thử
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                setSocket(newSocket);
                // Sau khi kết nối, yêu cầu lấy thông báo cũ
                newSocket.emit('get_my_notifications', (response) => {
                    if (response.status === 'ok') {
                        setNotifications(response.data);
                        setUnreadCount(response.data.filter(n => !n.isRead).length);
                    } else {
                        console.error("Failed to get notifications:", response.message);
                    }
                });
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                setSocket(null);
                // Có thể thử kết nối lại nếu lý do không phải là 'io client disconnect' (logout)
                if (reason !== 'io client disconnect') {
                    // Cân nhắc logic retry hoặc thông báo lỗi ở đây
                }
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err.message);
                // Xử lý lỗi kết nối, ví dụ: token hết hạn
                if (err.message.includes('Authentication error')) {
                    // Có thể dispatch logout hoặc refresh token ở đây
                    toast.error("Lỗi xác thực WebSocket. Vui lòng đăng nhập lại.");
                }
            });

            // Lắng nghe thông báo mới từ server
            newSocket.on('new_notification', (notification) => {
                console.log('New notification received:', notification);
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                // Hiển thị toast
                toast.info(notification.title);
            });

            // Cleanup khi component unmount (chỉ trong trường hợp đặc biệt)
            // return () => {
            //   console.log("Cleaning up socket connection on provider unmount");
            //   newSocket.disconnect();
            // };
        }
    }, [user, accessToken, socket]); // Thêm socket vào dependency để tránh kết nối lại khi đã có

    // Hàm ngắt kết nối socket (khi logout)
    const disconnectSocket = useCallback(() => {
        if (socket) {
            console.log("Disconnecting socket...");
            socket.disconnect();
            setSocket(null);
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [socket]);

    // Kết nối khi user đăng nhập và có token
    useEffect(() => {
        if (user && accessToken) {
            connectSocket();
        } else {
            // Ngắt kết nối khi user logout hoặc token mất
            disconnectSocket();
        }

        // Cleanup function khi SocketProvider unmount (hiếm khi xảy ra)
        return () => {
            disconnectSocket();
        };
    }, [user, accessToken, connectSocket, disconnectSocket]);


    // Hàm đánh dấu đã đọc
    const markAsRead = (notificationId) => {
        if (socket) {
            socket.emit('mark_as_read', notificationId, (response) => {
                if (response.status === 'ok') {
                    setNotifications(prev =>
                        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
                    );
                    setUnreadCount(prev => Math.max(0, prev - 1));
                } else {
                    console.error("Failed to mark notification as read:", response.message);
                }
            });
        }
    };

    // Hàm đánh dấu tất cả đã đọc
     const markAllAsRead = () => {
        if (socket && unreadCount > 0) {
            const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
            // Gửi từng yêu cầu (hoặc tạo endpoint mới ở backend để xử lý batch)
            unreadIds.forEach(id => markAsRead(id));
        }
    };


    return (
        <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, markAllAsRead }}>
            {children}
        </SocketContext.Provider>
    );
};