const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const savedJobRoutes = require("./routes/savedJobRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const profileRoutes = require("./routes/profileRoutes");








const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/saved-jobs", savedJobRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", profileRoutes);

module.exports = app;