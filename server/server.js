require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("../server/src/config/db");
const cors = require('cors'); // Install with: npm install cors
const path = require("path");

const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require("../server/src/routes/authRoutes");
app.use("/api/auth", authRoutes);
const userRoutes = require("../server/src/routes/userRoutes");
app.use("/api/user", userRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve static files

// Start Server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});