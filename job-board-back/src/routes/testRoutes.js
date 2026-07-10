const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// simple test route
router.get("/test-db", async (req, res) => {
    const { data, error } = await supabase
        .from("users")
        .select("*");

    if (error) {
        return res.status(500).json({
            message: "Database error",
            error: error.message
        });
    }

    return res.json({
        message: "Connected to Supabase successfully",
        data
    });
});

module.exports = router;