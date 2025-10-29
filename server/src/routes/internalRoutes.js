// src/routes/internalRoutes.js
const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const User = require('../models/User'); //

// Middleware đơn giản để bảo vệ API nội bộ (ví dụ: dùng secret key)
const internalAuthMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-internal-api-key'];
    if (apiKey === process.env.INTERNAL_API_KEY) { // INTERNAL_API_KEY đặt trong file .env
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized internal access' });
    }
};

// Route để tạo và gửi thông báo
router.post('/notifications', internalAuthMiddleware, async (req, res) => {
    const { userId, title, message, link, type = 'order' } = req.body;

    if (!userId || !title || !message) {
        return res.status(400).json({ message: 'Missing required fields: userId, title, message' });
    }

    try {
        // Gọi service đã có để xử lý
        await notificationService.createAndSendNotification(userId, { title, message, link, type });
        res.status(200).json({ success: true, message: 'Notification sent' });
    } catch (error) {
        console.error("Internal Notification Error:", error);
        res.status(500).json({ success: false, message: 'Failed to send notification' });
    }
});

module.exports = router;