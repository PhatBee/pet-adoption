const { Server } = require('socket.io');
const { verifyAccessToken } = require('../services/tokenService'); //
const notificationService = require('../services/notificationService');
const Notification = require('../models/Notification'); // Import model

let io;

function initializeSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // 1. Khởi tạo NotificationService và truyền 'io' vào
    notificationService.init(io);

    // 2. Middleware xác thực Socket.IO
    // Sẽ chạy mỗi khi có client mới kết nối
    io.use(async (socket, next) => {
        // Client sẽ gửi token qua 'socket.handshake.auth.token'
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: Token not provided'));
        }
        try {
            const userData = verifyAccessToken(token); //
            socket.user = userData; // Gắn thông tin user vào socket
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    // 3. Xử lý khi client kết nối thành công
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.email} (ID: ${socket.id})`);

        // 4. Cho user tham gia "room" riêng của họ
        // Đây là mấu chốt để gửi thông báo cho đúng user
        socket.join(socket.user.id.toString());

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.email}`);
        });

        // Lắng nghe sự kiện client yêu cầu lấy thông báo cũ
        socket.on('get_my_notifications', async (callback) => {
            try {
                const notifications = await Notification.find({ user: socket.user.id })
                    .sort({ createdAt: -1 })
                    .limit(20)
                    .lean();
                callback({ status: 'ok', data: notifications });
            } catch (error) {
                callback({ status: 'error', message: 'Could not fetch notifications' });
            }
        });

        // Lắng nghe sự kiện client đánh dấu đã đọc
        socket.on('mark_as_read', async (notificationId, callback) => {
             try {
                await Notification.updateOne(
                    { _id: notificationId, user: socket.user.id },
                    { isRead: true }
                );
                callback({ status: 'ok' });
            } catch (error) {
                 callback({ status: 'error', message: 'Could not mark as read' });
            }
        });
    });

    return io;
}

module.exports = { initializeSocket };