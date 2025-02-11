const db = require("../db");

// Get rewards for an employee
exports.getUserRewards = (userId, callback) => {
    db.all(
        `SELECT id, points, description, created_at 
         FROM incentives 
         WHERE user_id = ? 
         ORDER BY created_at DESC`,
        [userId],
        (err, rows) => {
            callback(err, rows);
        }
    );
};

// Get top contributors (Leaderboard)
exports.getTopContributors = (callback) => {
    db.all(
        `SELECT users.id, users.name, SUM(incentives.points) AS total_points
         FROM incentives 
         JOIN users ON incentives.user_id = users.id
         GROUP BY incentives.user_id
         ORDER BY total_points DESC
         LIMIT 10`,
        [],
        (err, rows) => {
            callback(err, rows);
        }
    );
};

// Get all system settings
exports.getIncentiveSettings = (callback) => {
    db.all(
        `SELECT setting_key, setting_value FROM system_settings 
         WHERE setting_key IN ('points_per_idea_submission', 'points_per_vote', 'points_per_comment', 'points_per_collaboration')`,
        [],
        (err, rows) => {
            callback(err, rows);
        }
    );
};

// Update incentive settings (Admin only)
exports.updateIncentiveSetting = (settingKey, settingValue, callback) => {
    db.run(
        `UPDATE system_settings SET setting_value = ? WHERE setting_key = ?`,
        [settingValue, settingKey],
        function (err) {
            if (err) return callback(err);
            if (this.changes === 0) return callback(new Error("Invalid setting key"));
            callback(null, { message: "Setting updated successfully" });
        }
    );
};
