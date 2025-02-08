const express = require("express");
const ideaController = require("../controllers/ideaController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, ideaController.createIdea);
router.get("/",authMiddleware, ideaController.getAllIdeas);
router.get("/:id",authMiddleware, ideaController.getIdeaById);
router.post("/:id/upvote", authMiddleware, ideaController.upvoteIdea);
router.put("/:id/status", authMiddleware, ideaController.updateIdeaStatus);
router.post("/comments", authMiddleware, ideaController.addComment);
router.get("/:id/comments", authMiddleware, ideaController.getCommentsByIdea);

module.exports = router;
