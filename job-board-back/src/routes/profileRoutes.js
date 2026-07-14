const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getProfile, getPublicProfile, updateProfile, uploadProfilePic, upload } = require("../controllers/profileController");

router.get("/profile", authMiddleware, getProfile);
router.get("/profile/:id", authMiddleware, getPublicProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/profile/upload-pic", authMiddleware, upload.single("profile_pic"), uploadProfilePic);

module.exports = router;
