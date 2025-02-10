const collaborationModel = require("../models/collaborationModel");

// Get approved ideas with active collaborator count
exports.getApprovedIdeas = (req, res) => {
    collaborationModel.getApprovedIdeas((err, ideas) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching approved ideas", error: err.message });
        }
        res.json(ideas);
    });
};

// Assign employees to an idea (Manager Only)
exports.assignTeam = (req, res) => {
    const { idea_id, user_ids, role } = req.body;
    if (!idea_id || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({ message: "Invalid request. Idea ID and user IDs are required" });
    }

    collaborationModel.assignTeam(idea_id, user_ids, role, (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(result);
    });
};

// Get team members of an idea
exports.getTeamByIdea = (req, res) => {
    collaborationModel.getTeamByIdea(req.params.ideaId, (err, team) => {
        if (err) return res.status(500).json({ message: "Error fetching team", error: err.message });
        res.json(team);
    });
};

// Get collaborations for an employee
exports.getEmployeeCollaborations = (req, res) => {
    collaborationModel.getEmployeeCollaborations(req.user.id, (err, collaborations) => {
        if (err) return res.status(500).json({ message: "Error fetching collaborations", error: err.message });
        res.json(collaborations);
    });
};

// Remove an employee from an idea (Manager Only)
exports.removeEmployeeFromIdea = (req, res) => {
    const { idea_id, user_id } = req.body;
    if (!idea_id || !user_id) {
        return res.status(400).json({ message: "Idea ID and User ID are required" });
    }

    collaborationModel.removeEmployeeFromIdea(idea_id, user_id, (err, result) => {
        if (err) return res.status(500).json({ message: "Error removing employee", error: err.message });
        res.json(result);
    });
};

// Get available collaborators
exports.getAvailableCollaborators = (req, res) => {
    collaborationModel.getAvailableCollaborators((err, collaborators) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching available collaborators", error: err.message });
        }
        res.json(collaborators);
    });
};
