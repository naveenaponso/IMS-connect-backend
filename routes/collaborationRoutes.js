const express = require("express");
const collaborationController = require("../controllers/collaborationController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/approved", authMiddleware, collaborationController.getApprovedIdeas); // get approved ideas with active collaborator count
router.post("/assign", authMiddleware, collaborationController.assignTeam);  // Assign employees to an idea (Manager only)
router.get("/idea/:ideaId", authMiddleware, collaborationController.getTeamByIdea); // Get team members of an idea
router.get("/my-collaborations", authMiddleware, collaborationController.getEmployeeCollaborations); // Get employee collaborations
router.delete("/remove", authMiddleware, collaborationController.removeEmployeeFromIdea); // Remove employee from an idea (Manager only)
router.get("/available-collaborators",authMiddleware, collaborationController.getAvailableCollaborators);

module.exports = router;
