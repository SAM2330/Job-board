const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
    createJob,
    getJobs,
    getJob
} = require("../controllers/jobController");

// public
router.get("/", getJobs);
router.get("/:id", getJob);

// protected
router.post("/", authMiddleware, createJob);

module.exports = router;