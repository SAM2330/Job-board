const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
    getMyNotifications,
    markAsRead
} = require("../controllers/notificationController");

router.get("/", authMiddleware, getMyNotifications);
router.put("/:id/read", authMiddleware, markAsRead);

module.exports = router;