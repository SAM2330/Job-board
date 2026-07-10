const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
    saveJob,
    getSavedJobs,
    removeSavedJob
} = require("../controllers/savedJobController");

router.post("/", authMiddleware, saveJob);
router.get("/", authMiddleware, getSavedJobs);
router.delete("/:job_id", authMiddleware, removeSavedJob);

module.exports = router;