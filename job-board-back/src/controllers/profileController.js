const supabase = require("../config/supabase");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const getProfile = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { data: user, error } = await supabase
            .from("users")
            .select("id, name, email, role, bio, profile_pic, skills, education, experience_summary, resume_url, company_name, company_website, company_industry, company_size")
            .eq("id", userId)
            .single();

        if (error) return res.status(404).json({ message: "User not found" });

        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPublicProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: user, error } = await supabase
            .from("users")
            .select("id, name, role, bio, profile_pic, skills, education, experience_summary, resume_url, company_name, company_website, company_industry, company_size")
            .eq("id", id)
            .single();

        if (error) return res.status(404).json({ message: "User not found" });

        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { name, bio, profile_pic, skills, education, experience_summary, resume_url, company_name, company_website, company_industry, company_size } = req.body;

        const updates = { name, bio, profile_pic, skills, education, experience_summary, resume_url, company_name, company_website, company_industry, company_size };
        // remove undefined fields
        Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);

        const { data: user, error } = await supabase
            .from("users")
            .update(updates)
            .eq("id", userId)
            .select("id, name, email, role, bio, profile_pic, skills, education, experience_summary, resume_url, company_name, company_website, company_industry, company_size")
            .single();

        if (error) return res.status(500).json({ message: error.message });

        res.json({ message: "Profile updated", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const uploadProfilePic = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const file = req.file;

        if (!file) return res.status(400).json({ message: "No file uploaded" });

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({ message: "Only JPEG, PNG, WEBP, or GIF images are allowed" });
        }

        const ext = file.mimetype.split("/")[1];
        const fileName = `${userId}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });

        if (uploadError) return res.status(500).json({ message: uploadError.message });

        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);

        // save to user record
        await supabase.from("users").update({ profile_pic: publicUrl }).eq("id", userId);

        res.json({ message: "Profile picture uploaded", url: publicUrl });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getProfile, getPublicProfile, updateProfile, uploadProfilePic, upload };
