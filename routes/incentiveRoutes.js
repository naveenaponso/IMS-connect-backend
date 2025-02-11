const express = require("express");
const incentiveController = require("../controllers/incentiveController");
const authMiddleware = require("../middlewares/authMiddleware");
// const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

router.get("/my-rewards", authMiddleware, incentiveController.viewUserRewards);
router.get("/leaderboard", authMiddleware, incentiveController.getLeaderboard);
router.get("/settings", authMiddleware, incentiveController.viewIncentiveSettings);
router.put("/settings", authMiddleware, incentiveController.updateIncentiveThresholds);

module.exports = router;
