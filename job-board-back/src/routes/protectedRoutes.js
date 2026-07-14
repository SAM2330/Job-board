const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const supabase = require("../config/supabase");

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: "User profile not found" });
        }

        const { password, ...userWithoutPassword } = user;
        res.json({
            message: "Profile retrieved successfully",
            user: userWithoutPassword
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { 
            name, 
            bio, 
            profile_pic, 
            skills, 
            education, 
            experience_summary, 
            resume_url, 
            company_name, 
            company_website, 
            company_industry, 
            company_size 
        } = req.body;

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (bio !== undefined) updates.bio = bio;
        if (profile_pic !== undefined) updates.profile_pic = profile_pic;
        if (skills !== undefined) updates.skills = skills;
        if (education !== undefined) updates.education = education;
        if (experience_summary !== undefined) updates.experience_summary = experience_summary;
        if (resume_url !== undefined) updates.resume_url = resume_url;
        if (company_name !== undefined) updates.company_name = company_name;
        if (company_website !== undefined) updates.company_website = company_website;
        if (company_industry !== undefined) updates.company_industry = company_industry;
        if (company_size !== undefined) updates.company_size = company_size;

        const { data, error } = await supabase
            .from("users")
            .update(updates)
            .eq("id", req.user.id)
            .select();

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        const updatedUser = Array.isArray(data) ? data[0] : data;
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found to update" });
        }
        
        const { password, ...userWithoutPassword } = updatedUser;

        res.json({
            message: "Profile updated successfully",
            user: userWithoutPassword
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;