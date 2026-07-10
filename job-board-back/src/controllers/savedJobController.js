const supabase = require("../config/supabase");

const saveJob = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const { job_id } = req.body;

        // only seekers
        if (role !== "seeker") {
            return res.status(403).json({
                message: "Only job seekers can save jobs"
            });
        }

        // check duplicate
        const { data: existing } = await supabase
            .from("saved_jobs")
            .select("*")
            .eq("user_id", userId)
            .eq("job_id", job_id)
            .single();

        if (existing) {
            return res.status(400).json({
                message: "Job already saved"
            });
        }

        const { data, error } = await supabase
            .from("saved_jobs")
            .insert([
                {
                    user_id: userId,
                    job_id
                }
            ])
            .select();

        if (error) {
            return res.status(500).json({
                message: error.message
            });
        }

        res.status(201).json({
            message: "Job saved successfully",
            saved: data[0]
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
const getSavedJobs = async (req, res) => {
    try {
        const { id: userId, role } = req.user;

        if (role !== "seeker") {
            return res.status(403).json({
                message: "Only job seekers can access saved jobs"
            });
        }

        const { data, error } = await supabase
            .from("saved_jobs")
            .select(`
                id,
                created_at,
                jobs (
                    id,
                    title,
                    description,
                    location,
                    salary,
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
            totalSaved: data.length,
            savedJobs: data
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
const removeSavedJob = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { job_id } = req.params;

        const { error } = await supabase
            .from("saved_jobs")
            .delete()
            .eq("user_id", userId)
            .eq("job_id", job_id);

        if (error) {
            return res.status(500).json({
                message: error.message
            });
        }

        res.json({
            message: "Saved job removed"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
module.exports = {
    saveJob,
    getSavedJobs,
    removeSavedJob
};
