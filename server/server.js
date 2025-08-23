require("dotenv").config();
const express = require("express");
const connectDB = require("../server/src/config/db");

const app = express();
app.use(express.json());

// Routes
const authRoutes = require("../server/src/routes/authRoutes");
app.use("/api/auth", authRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});