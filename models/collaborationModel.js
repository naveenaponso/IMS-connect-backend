const db = require("../db");

// Get approved ideas with active collaborator count
exports.getApprovedIdeas = (callback) => {
    db.all(
        `SELECT ideas.*, 
        (SELECT COUNT(*) FROM collaborations WHERE collaborations.idea_id = ideas.id AND collaborations.status = 'active') 
            AS active_collaborators,
        users.name AS author_name
        FROM ideas
        LEFT JOIN users ON ideas.created_by = users.id 
        WHERE status != 'pending'`,
        [],
        (err, rows) => {
            callback(err, rows);
        }
    );
};

// Assign employees to an idea
exports.assignTeam = (ideaId, userIds, role, callback) => {
    // Validate if idea is approved
    db.get(`SELECT status FROM ideas WHERE id = ?`, [ideaId], (err, idea) => {
        if (err) return callback(err);
        if (!idea || idea.status !== "approved") {
            return callback(new Error("Idea must be approved before assigning a team"));
        }

        // Assign each user to the idea
        const insertStmt = db.prepare(`INSERT INTO collaborations (idea_id, user_id, role) VALUES (?, ?, ?)`);
        userIds.forEach(userId => {
            insertStmt.run([ideaId, userId, role], (err) => {
                if (err && err.code !== "SQLITE_CONSTRAINT") console.error("Error assigning team member:", err);
            });
        });
        insertStmt.finalize();
        callback(null, { message: "Team assigned successfully" });
    });
};

// Get team members for an idea
exports.getTeamByIdea = (ideaId, callback) => {
    db.all(
        `SELECT users.id, users.name, users.role, collaborations.role AS team_role, collaborations.status
         FROM collaborations
         JOIN users ON collaborations.user_id = users.id
         WHERE collaborations.idea_id = ?`,
        [ideaId],
        (err, rows) => {
            callback(err, rows);
        }
    );
};

// Track collaboration details for an employee
exports.getEmployeeCollaborations = (userId, callback) => {
    db.all(
        `SELECT ideas.id AS idea_id, ideas.title, collaborations.role AS team_role, collaborations.status
         FROM collaborations
         JOIN ideas ON collaborations.idea_id = ideas.id
         WHERE collaborations.user_id = ?`,
        [userId],
        (err, rows) => {
            callback(err, rows);
        }
    );
};

// Remove an employee from an idea
exports.removeEmployeeFromIdea = (ideaId, userId, callback) => {
    db.run(
        `DELETE FROM collaborations WHERE idea_id = ? AND user_id = ?`,
        [ideaId, userId],
        function (err) {
            callback(err, { message: "Employee removed from idea" });
        }
    );
};


// Get available collaborators (users who are NOT in any active collaboration)
exports.getAvailableCollaborators = (callback) => {
    db.all(
        `WITH LocationHierarchy AS (
            -- Recursively get the branch, country, and region
            SELECT 
                l1.id AS branch_id, l1.name AS branch_name,
                l2.id AS country_id, l2.name AS country_name,
                l3.id AS region_id, l3.name AS region_name
            FROM locations l1
            LEFT JOIN locations l2 ON l1.parent_id = l2.id AND l2.type = 'country'
            LEFT JOIN locations l3 ON l2.parent_id = l3.id AND l3.type = 'region'
            )
            SELECT 
                users.id, 
                users.name, 
                users.email, 
                users.role, 
                users.location_id, 
                lh.branch_id, lh.branch_name,
                lh.country_id, lh.country_name,
                lh.region_id, lh.region_name
            FROM users
            LEFT JOIN HR_Employees ON users.email = HR_Employees.email
            LEFT JOIN LocationHierarchy lh ON users.location_id = lh.branch_id
            WHERE users.id NOT IN (
                SELECT user_id FROM collaborations WHERE status = 'active'
            );
        `,
        [],
        (err, rows) => {
            callback(err, rows);
        }
    );
};