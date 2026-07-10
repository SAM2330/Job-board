const supabase = require("../config/supabase");

const getMyNotifications = async (req, res) => {
    try {
        const { id: userId } = req.user;

        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(500).json({
                message: error.message
            });
        }

        res.json({
            totalNotifications: data.length,
            notifications: data
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id)
            .select();

        if (error) {
            return res.status(500).json({
                message: error.message
            });
        }

        res.json({
            message: "Notification marked as read",
            notification: data[0]
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};


module.exports = { getMyNotifications, markAsRead };