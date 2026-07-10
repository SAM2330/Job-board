const supabase = require("../config/supabase");

const createNotification = async (userId, message) => {
    const { error } = await supabase
        .from("notifications")
        .insert([
            {
                user_id: userId,
                message
            }
        ]);

    if (error) {
        console.log("Notification error:", error.message);
    }
};

module.exports = createNotification;