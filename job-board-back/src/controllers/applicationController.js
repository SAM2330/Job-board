const supabase = require("../config/supabase");
const createNotification = require("../services/notificationService");

const applyJob = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const { job_id, cover_letter, resume_url } = req.body;

        // 1. only seekers can apply
        if (role !== "seeker") {
            return res.status(403).json({ message: "Only job seekers can apply" });
        }

        // 2. check if already applied
        const { data: existing } = await supabase
            .from("applications")
            .select("*")
            .eq("job_id", job_id)
            .eq("user_id", userId)
            .single();

        if (existing) {
            return res.status(400).json({ message: "Already applied" });
        }

        // 3. insert application
        const { data, error } = await supabase
            .from("applications")
            .insert([
                {
                    job_id,
                    user_id: userId,
                    cover_letter,
                    resume_url
                }
            ])
            .select();

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        res.status(201).json({
            message: "Application submitted",
            application: data[0]
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const getJobApplications = async (req, res) => {
    try {
        const { job_id } = req.params;

        const { data, error } = await supabase
            .from("applications")
            .select("*")
            .eq("job_id", job_id);

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        res.json(data);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const updateApplicationStatus = async (req, res) => {
    try {
        const { role } = req.user;
        const { application_id, status } = req.body;

        // 1. only employers can update
        if (role !== "employer") {
            return res.status(403).json({ message: "Only employers can update applications" });
        }

        // 2. validate status
        const allowed = ["accepted", "rejected", "pending"];

        if (!allowed.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // 3. update in Supabase
        const { data, error } = await supabase
            .from("applications")
            .update({ status })
            .eq("id", application_id)
            .select();

        if (error) {
            return res.status(500).json({ message: error.message });
        }
        await createNotification(
    data[0].user_id,
    `Your application has been ${status}`
);

        res.json({
            message: "Status updated",
            application: data[0]
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const uploadResume = async (req, res) => {
    try {
        const file = req.file;
        const { id: userId } = req.user;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const allowedTypes = ["application/pdf"];
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({ message: "Only PDF files are allowed" });
        }

        const fileName = `${userId}-${Date.now()}.pdf`;

        const { data, error } = await supabase.storage
            .from("resumes")
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        const url = supabase.storage
            .from("resumes")
            .getPublicUrl(fileName).data.publicUrl;

        res.json({
            message: "Resume uploaded",
            url
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const getMyApplications = async (req, res) => {
    try {
        const { id: userId, role } = req.user;

        // only seekers
        if (role !== "seeker") {
            return res.status(403).json({
                message: "Only job seekers can access this"
            });
        }

        const { data, error } = await supabase
            .from("applications")
            .select(`
                id,
                cover_letter,
                resume_url,
                status,
                created_at,
                jobs (
                    id,
                    title,
                    location,
                    salary_min,
                    salary_max,
                    type
                )
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(500).json({
                message: error.message
            });
        }

        res.json({
            totalApplications: data.length,
            applications: data
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
module.exports = {
    applyJob,
    getJobApplications,
    updateApplicationStatus,
    uploadResume,
    getMyApplications
};