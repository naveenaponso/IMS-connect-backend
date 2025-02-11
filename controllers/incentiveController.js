const incentiveModel = require("../models/incentiveModel");

// Get rewards for an employee
exports.viewUserRewards = (req, res) => {
    const userId = req.user.id; // Extract from auth middleware

    incentiveModel.getUserRewards(userId, (err, rewards) => {
        if (err) return res.status(500).json({ message: "Error fetching rewards", error: err.message });
        if (rewards.length === 0) return res.status(404).json({ message: "No rewards available" });
        res.json(rewards);
    });
};

// Get leaderboard of top contributors
exports.getLeaderboard = (req, res) => {
    incentiveModel.getTopContributors((err, leaderboard) => {
        if (err) return res.status(500).json({ message: "Error fetching leaderboard", error: err.message });
        res.json(leaderboard);
    });
};

// Get current incentive settings
exports.viewIncentiveSettings = (req, res) => {
    incentiveModel.getIncentiveSettings((err, settings) => {
        if (err) return res.status(500).json({ message: "Error fetching settings", error: err.message });
        res.json(settings);
    });
};

// Update incentive thresholds (Admin only)
exports.updateIncentiveThresholds = (req, res) => {
    const { settingKey, settingValue } = req.body;

    if (!settingKey || !settingValue) {
        return res.status(400).json({ message: "Invalid input values" });
    }

    incentiveModel.updateIncentiveSetting(settingKey, settingValue, (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(result);
    });
};
