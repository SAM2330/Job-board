const supabase = require("../config/supabase");

const createJob = async (req, res) => {
    try {
        const { role, id: userId } = req.user;

        // 1. Only employers can create jobs
        if (role !== "employer") {
            return res.status(403).json({ message: "Only employers can create jobs" });
        }

        const {
             title,
             description,
             location,
             type,
             salaryMin,
             salaryMax,
             requiredSkills,
             perks
} = req.body;

        // 2. validation
        if (!title || !description) {
            return res.status(400).json({ message: "Title and description required" });
        }

        // 3. insert job
        const { data, error } = await supabase
    .from("jobs")
    .insert([
        {
            title,
            description,
            location,
            type,
            salary_min: salaryMin,
            salary_max: salaryMax,
            required_skills: requiredSkills || [],
            perks: perks || [],
            employer_id: userId
        }
    ])
    .select();

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        res.status(201).json({
            message: "Job created successfully",
            job: data[0]
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// const getJobs = async (req, res) => {
//     try {
//         const { data, error } = await supabase
//             .from("jobs")
//             .select("*")
//             .order("created_at", { ascending: false });

//         if (error) {
//             return res.status(500).json({ message: error.message });
//         }

//         res.json(data);

//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };
const getJob = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.json(data);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const getJobs = async (req, res) => {
    try {
        const {
            search,
            location,
            type,
            page = 1,
            limit = 10
        } = req.query;

        const currentPage = parseInt(page);
        const pageLimit = parseInt(limit);

        const start = (currentPage - 1) * pageLimit;
        const end = start + pageLimit - 1;

        let query = supabase
            .from("jobs")
            .select("*", { count: "exact" });

        // search
        if (search) {
            query = query.or(
                `title.ilike.%${search}%,description.ilike.%${search}%`
            );
        }

        // filters
        if (location) {
            query = query.eq("location", location);
        }

        if (type) {
            query = query.eq("type", type);
        }

        const { data, error, count } = await query
            .order("created_at", { ascending: false })
            .range(start, end);

        if (error) {
            return res.status(500).json({
                message: error.message
            });
        }

        res.json({
            currentPage,
            pageLimit,
            totalJobs: count,
            totalPages: Math.ceil(count / pageLimit),
            jobs: data
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
module.exports = {
    createJob,
    getJobs,
    getJob
};