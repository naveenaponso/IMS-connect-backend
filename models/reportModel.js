const db = require("../db");

// Get idea report based on filters
exports.getIdeaReport = (startDate, endDate, status, callback) => {
    let query = `
        SELECT ideas.id, ideas.title, ideas.status, ideas.created_at, users.name AS submitted_by,
            (SELECT COUNT(*) FROM collaborations WHERE collaborations.idea_id = ideas.id AND collaborations.status = 'active') 
            AS active_collaborators
        FROM ideas
        JOIN users ON ideas.created_by = users.id
        WHERE 1=1
    `;
    
    const params = [];
    
    if (startDate) {
        query += " AND DATE(ideas.created_at) >= ?";
        params.push(startDate);
    }

    if (endDate) {
        query += " AND DATE(ideas.created_at) <= ?";
        params.push(endDate);
    }

    if (status) {
        query += " AND ideas.status = ?";
        params.push(status);
    }

    db.all(query, params, (err, rows) => {
        callback(err, rows);
    });
};

// Get collaboration report based on filters
exports.getCollaborationReport = (startDate, endDate, callback) => {
    let query = `
        SELECT collaborations.idea_id, ideas.title, users.name AS collaborator_name, collaborations.role, collaborations.assigned_at
        FROM collaborations
        JOIN ideas ON collaborations.idea_id = ideas.id
        JOIN users ON collaborations.user_id = users.id
        WHERE 1=1
    `;
    
    const params = [];

    if (startDate) {
        query += " AND DATE(collaborations.assigned_at) >= ?";
        params.push(startDate);
    }

    if (endDate) {
        query += " AND DATE(collaborations.assigned_at) <= ?";
        params.push(endDate);
    }

    db.all(query, params, (err, rows) => {
        callback(err, rows);
    });
};
