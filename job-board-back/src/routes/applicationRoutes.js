const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
    applyJob,
    getJobApplications,
    updateApplicationStatus,
    uploadResume,
    getMyApplications
} = require("../controllers/applicationController");

// apply to job
router.post("/", authMiddleware, applyJob);

router.get("/me", authMiddleware, getMyApplications);

// get applications for a job
router.get("/:job_id", authMiddleware, getJobApplications);

router.put("/status", authMiddleware, updateApplicationStatus);
router.post("/upload-resume", authMiddleware, upload.single("resume"), uploadResume);


module.exports = router;