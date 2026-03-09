require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const requestId = require("./middlewares/requestId");
const errorHandler = require("./middlewares/errorHandler");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const reportRoutes = require("./routes/reports");
const adminReportRoutes = require("./routes/adminReports");
const adminUserRoutes = require("./routes/adminUsers");

const app = express();

app.use(cors());
app.use(requestId);
app.use(helmet());
app.use(morgan("dev"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(express.json());

// uploads statik servis (foto url: /uploads/xxx.jpg)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Citizen
app.use("/api/reports", reportRoutes);

// Admin/Authority
app.use("/api/admin/reports", adminReportRoutes);
app.use("/api/admin/users", adminUserRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, requestId: req.requestId });
});

// Error handler en sonda
app.use(errorHandler);

module.exports = app;