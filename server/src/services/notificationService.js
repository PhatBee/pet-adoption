const Notification = require('../models/Notification');
const { sendEmail } = require('./emailService'); //
const User = require('../models/User');

let io;

/**
 * Khởi tạo service với instance của Socket.IO
 * Được gọi từ socketHandler.js
 */
function init(socketIoInstance) {
    io = socketIoInstance;
    console.log('NotificationService initialized with Socket.IO');
}

/**
 * Hàm chính: Tạo, lưu và gửi thông báo
 * @param {string} userId - ID của người nhận
 * @param {object} notificationData - { title, message, link, type }
 */
async function createAndSendNotification(userId, { title, message, link, type = 'order' }) {
    if (!userId) {
        console.warn("Notification Service: userId is required.");
        return;
    }

    try {
        // Tìm user để lấy email
        const user = await User.findById(userId).select('email name').lean();
        if (!user) {
            console.warn(`Notification Service: User not found ${userId}`);
            return;
        }

        // 1. Lưu thông báo vào Database
        const newNotification = new Notification({
            user: userId,
            title,
            message,
            link,
            type
        });
        await newNotification.save();
        
        // 2. Gửi thông báo qua WebSocket
        if (io) {
            // Gửi đến "room" của user (chính là userId của họ)
            io.to(userId.toString()).emit('new_notification', newNotification);
        } else {
            console.warn("Socket.IO not initialized, skipping WebSocket emit.");
        }

        // 3. Gửi thông báo qua Email
        // Format lại nội dung email cho đầy đủ hơn
        const emailSubject = `PetStore: ${title}`;
        const emailText = `
Chào ${user.name},

${message}

${link ? `Bạn có thể xem chi tiết tại: ${process.env.CLIENT_URL}${link}` : ''}

Cảm ơn bạn đã sử dụng dịch vụ.
`;
        await sendEmail(user.email, emailSubject, emailText); //

    } catch (error) {
        console.error(`Failed to create/send notification for user ${userId}:`, error);
    }
}

module.exports = {
    init,
    createAndSendNotification
};