const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Rất quan trọng để tìm kiếm nhanh
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    // Đường dẫn (link) mà thông báo sẽ trỏ tới khi click
    // Ví dụ: /orders/60f...
    link: { 
        type: String,
    },
    // Trạng thái đã đọc hay chưa
    isRead: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        enum: ['order', 'promotion', 'system'], // Phân loại thông báo
        default: 'order'
    }
}, { timestamps: true }); // Tự động thêm createdAt, updatedAt

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;