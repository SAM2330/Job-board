const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
    createJob,
    getJobs,
    getJob,
    uploadCompanyLogo,
    upload
} = require("../controllers/jobController");

// public
router.get("/", getJobs);
router.get("/:id", getJob);

// protected
router.post("/", authMiddleware, createJob);
router.post("/upload-logo", authMiddleware, upload.single("company_logo"), uploadCompanyLogo);

module.exports = router;