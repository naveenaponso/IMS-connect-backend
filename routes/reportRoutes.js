const express = require("express");
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/ideas", authMiddleware, reportController.generateIdeaReport);
router.get("/collaborations", authMiddleware, reportController.generateCollaborationReport);

module.exports = router;
