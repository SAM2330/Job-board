const supabase = require("../config/supabase");

const getEmployerJobs = async (req, res) => {
    try {
        const { id: employerId, role } = req.user;

        // only employers
        if (role !== "employer") {
            return res.status(403).json({
                message: "Only employers can access dashboard"
            });
        }

        const { data, error } = await supabase
            .from("jobs")
            .select("*")
            .eq("employer_id", employerId)
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(500).json({
                message: error.message
            });
        }

        res.json(data);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
const getEmployerStats = async (req, res) => {
    try {
        const { id: employerId, role } = req.user;

        if (role !== "employer") {
            return res.status(403).json({
                message: "Only employers can access stats"
            });
        }

        // 1. get employer jobs
        const { data: jobs, error: jobError } = await supabase
            .from("jobs")
            .select("id")
            .eq("employer_id", employerId);

        if (jobError) {
            return res.status(500).json({
                message: jobError.message
            });
        }

        const jobIds = jobs.map(job => job.id);

        // if no jobs yet
        if (jobIds.length === 0) {
            return res.json({
                totalJobs: 0,
                totalApplications: 0,
                pending: 0,
                accepted: 0,
                rejected: 0
            });
        }

        // 2. get all applications
        const { data: applications, error: appError } = await supabase
            .from("applications")
            .select("status")
            .in("job_id", jobIds);

        if (appError) {
            return res.status(500).json({
                message: appError.message
            });
        }

        // 3. count statuses
        const pending = applications.filter(app => app.status === "pending").length;
        const accepted = applications.filter(app => app.status === "accepted").length;
        const rejected = applications.filter(app => app.status === "rejected").length;

        res.json({
            totalJobs: jobs.length,
            totalApplications: applications.length,
            pending,
            accepted,
            rejected
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
const getJobApplicants = async (req, res) => {
    try {
        const { id: employerId, role } = req.user;
        const { id: jobId } = req.params;

        // only employers
        if (role !== "employer") {
            return res.status(403).json({
                message: "Only employers can view applicants"
            });
        }

        // 1. verify job ownership
        const { data: job, error: jobError } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", jobId)
            .eq("employer_id", employerId)
            .single();

        if (jobError || !job) {
            return res.status(404).json({
                message: "Job not found or unauthorized"
            });
        }

        // 2. fetch applications for this job
        const { data: applicants, error: appError } = await supabase
            .from("applications")
            .select(`
    id,
    cover_letter,
    resume_url,
    status,
    created_at,
    users (
        id,
        name,
        email,
        profile_pic
    )
`)
            .eq("job_id", jobId)
            .order("created_at", { ascending: false });

        if (appError) {
            return res.status(500).json({
                message: appError.message
            });
        }

        res.json({
            jobTitle: job.title,
            totalApplicants: applicants.length,
            applicants
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
module.exports = {
    getEmployerJobs,
    getEmployerStats,
    getJobApplicants
};