const ideaModel = require("../models/ideaModel");

// Create a new idea
exports.createIdea = (req, res) => {
    const { title, description, category } = req.body;
    const created_by = req.user.id; // Get user ID from JWT token

    if (!title || !description || !category) {
        return res.status(400).json({ message: "All fields are required" });
    }

    ideaModel.createIdea({ title, description, category, created_by }, (err, idea) => {
        if (err) return res.status(500).json({ message: "Error creating idea", error: err.message });
        res.status(201).json({ message: "Idea submitted successfully", idea });
    });
};

// Get all ideas
exports.getAllIdeas = (req, res) => {
    ideaModel.getAllIdeas((err, ideas) => {
        if (err) return res.status(500).json({ message: "Error fetching ideas", error: err.message });
        res.json(ideas);
    });
};

// Get idea by ID
exports.getIdeaById = (req, res) => {
    ideaModel.getIdeaById(req.params.id, (err, idea) => {
        if (err) return res.status(500).json({ message: "Error fetching idea", error: err.message });
        if (!idea) return res.status(404).json({ message: "Idea not found" });
        res.json(idea);
    });
};

exports.upvoteIdea = (req, res) => {
    const userId = req.user.id; // Extract user ID from JWT token
    const ideaId = req.params.id;

    // Check if user has already voted
    ideaModel.hasUserVoted(userId, ideaId, (err, hasVoted) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        if (hasVoted) return res.status(400).json({ message: "You have already voted for this idea" });

        // Proceed with upvoting if user has not voted
        ideaModel.upvoteIdea(userId, ideaId, (err, result) => {
            if (err) return res.status(500).json({ message: "Error upvoting idea", error: err.message });
            res.json({ message: "Idea upvoted successfully", result });
        });
    });
};

// Update idea status after checking if the idea exists
exports.updateIdeaStatus = (req, res) => {
    const { status } = req.body;
    const ideaId = req.params.id;
    const userRole = req.user.role; // Get role from authenticated user

    if (userRole !== "manager") {
        return res.status(403).json({ message: "Only managers can approve ideas" });
    }
    // First, check if the idea exists
    ideaModel.getIdeaById(ideaId, (err, idea) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        if (!idea) return res.status(404).json({ message: "Idea not found" });

        // If the idea exists, update the status
        ideaModel.updateIdeaStatus(ideaId, status, (err, result) => {
            if (err) return res.status(500).json({ message: "Error updating status", error: err.message });
            res.json({ message: "Idea status updated successfully", updatedIdea: { id: ideaId, status } });
        });
    });
};

// Request collaboration
exports.requestCollaboration = (req, res) => {
    const { idea_id } = req.body;
    const user_id = req.user.id;
    ideaModel.requestCollaboration(idea_id, user_id, (err, result) => {
        if (err) return res.status(500).json({ message: "Error requesting collaboration", error: err.message });
        res.json(result);
    });
};

// Get all collaborations for an idea
exports.getCollaborations = (req, res) => {
    ideaModel.getCollaborations(req.params.id, (err, collaborations) => {
        if (err) return res.status(500).json({ message: "Error fetching collaborations", error: err.message });
        res.json(collaborations);
    });
};


// Add a new comment
exports.addComment = (req, res) => {
    const userId = req.user.id; // Extract user ID from JWT token
    const { ideaId, comment } = req.body;

    if (!ideaId || !comment) {
        return res.status(400).json({ message: "Idea ID and comment text are required" });
    }

    ideaModel.addComment(userId, ideaId, comment, (err, newComment) => {
        if (err) return res.status(500).json({ message: "Error adding comment", error: err.message });
        res.status(201).json({ message: "Comment added successfully", comment: newComment });
    });
};

// Get all comments for an idea
exports.getCommentsByIdea = (req, res) => {
    const ideaId = req.params.id;

    ideaModel.getCommentsByIdea(ideaId, (err, comments) => {
        if (err) return res.status(500).json({ message: "Error fetching comments", error: err.message });
        res.json(comments);
    });
};
