const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
    getEmployerJobs,
    getEmployerStats,
    getJobApplicants
} = require("../controllers/dashboardController");

router.get("/jobs", authMiddleware, getEmployerJobs);
router.get("/stats", authMiddleware, getEmployerStats);
router.get("/job/:id/applicants", authMiddleware, getJobApplicants);

module.exports = router;