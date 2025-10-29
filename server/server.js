require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("../server/src/config/db");
const cors = require('cors'); // Install with: npm install cors
const path = require("path");
const http = require('http'); // 1. Import http
const { initializeSocket } = require('./src/socket/socketHandler'); // 2. Import handler socket

const authRoutes = require("../server/src/routes/authRoutes");
const userRoutes = require("../server/src/routes/userRoutes");
const productRoutes = require("../server/src/routes/productRoutes");
const cartRoutes = require("../server/src/routes/cartRoutes");
const checkoutRoutes = require("../server/src/routes/checkoutRoutes");
const orderRoutes = require("../server/src/routes/orderRoutes");
const adminRoutes = require("../server/src/routes/adminRoutes");
const wishlistRoutes = require("../server/src/routes/wishlistRoute");
const couponRoutes = require('./src/routes/couponRoutes');
const errorHandlerMiddleware = require("./src/middleware/errorHandlerMiddleware");
const internalRoutes = require('./src/routes/internalRoutes');

const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());
app.use(cookieParser());

// 3. Tạo HTTP server từ Express app
const server = http.createServer(app);

// 4. Khởi tạo Socket.IO và truyền 'server' vào
// Hàm này cũng sẽ tự động khởi tạo NotificationService
initializeSocket(server);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use('/uploads', express.static(path.join(__dirname, '/uploads'))); // Serve static files
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use("/api/internal", internalRoutes);

// --- 2. ĐẶT MIDDLEWARE XỬ LÝ LỖI Ở CUỐI CÙNG ---
// Nó phải là app.use() cuối cùng!
app.use(errorHandlerMiddleware);

// Start Server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    //Cron
    require("./src/jobs/orderJob");
    require("./src/jobs/orderVnpayJob");
    require("./src/jobs/orderMomoJob");
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});