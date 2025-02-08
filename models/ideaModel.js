const db = require("../db");

// Create a new idea
exports.createIdea = (idea, callback) => {
    const { title, description, category, created_by } = idea;
    db.run(
        `INSERT INTO ideas (title, description, category, created_by) VALUES (?, ?, ?, ?)`,
        [title, description, category, created_by],
        function (err) {
            if (err) return callback(err);
            callback(null, { id: this.lastID, ...idea });
        }
    );
};

exports.getAllIdeas = (callback) => {
    db.all(
        `SELECT ideas.*, 
                users.name AS author_name, 
                (SELECT COUNT(*) FROM votes WHERE votes.idea_id = ideas.id) AS vote_count,
                (SELECT COUNT(*) FROM comments WHERE comments.idea_id = ideas.id) AS comment_count
         FROM ideas
         LEFT JOIN users ON ideas.created_by = users.id 
         GROUP BY ideas.id 
         ORDER BY ideas.created_at DESC`, 
        [], 
        (err, rows) => {
            callback(err, rows);
        }
    );
};


exports.getIdeaById = (id, callback) => {
    db.get(
        `SELECT ideas.*, 
                users.name AS author_name, 
                (SELECT COUNT(*) FROM votes WHERE votes.idea_id = ideas.id) AS vote_count,
                (SELECT COUNT(*) FROM comments WHERE comments.idea_id = ideas.id) AS comment_count
         FROM ideas
         LEFT JOIN users ON ideas.created_by = users.id
         WHERE ideas.id = ?`,
        [id],
        (err, row) => {
            callback(err, row);
        }
    );
};

// Check if user has already voted
exports.hasUserVoted = (userId, ideaId, callback) => {
    db.get(`SELECT * FROM votes WHERE user_id = ? AND idea_id = ?`, [userId, ideaId], (err, row) => {
        if (err) return callback(err);
        callback(null, row ? true : false); // If row exists, user has voted
    });
};

exports.upvoteIdea = (userId, ideaId, callback) => {
    // Check if user has already voted
    db.get(`SELECT * FROM votes WHERE user_id = ? AND idea_id = ?`, [userId, ideaId], (err, row) => {
        if (err) return callback(err);
        if (row) return callback(new Error("You have already voted for this idea"));

        // Insert vote if the user hasn't voted before
        db.run(`INSERT INTO votes (user_id, idea_id) VALUES (?, ?)`, [userId, ideaId], function (err) {
            if (err) return callback(err);

            // Fetch the updated vote count from the votes table
            db.get(`SELECT COUNT(*) AS votes FROM votes WHERE idea_id = ?`, [ideaId], (err, result) => {
                if (err) return callback(err);
                callback(null, { message: "Vote recorded", idea_id: ideaId, votes: result.votes });
            });
        });
    });
};


// Track idea status
exports.updateIdeaStatus = (id, status, callback) => {
    db.run(`UPDATE ideas SET status = ? WHERE id = ?`, [status, id], function (err) {
        if (err) return callback(err);
        callback(null, { message: "Idea status updated successfully" });
    });
};

// Request collaboration
exports.requestCollaboration = (idea_id, user_id, callback) => {
    db.run(
        `INSERT INTO collaborations (idea_id, user_id) VALUES (?, ?)`,
        [idea_id, user_id],
        function (err) {
            if (err) return callback(err);
            callback(null, { message: "Collaboration request sent" });
        }
    );
};

// Get all collaborations for an idea
exports.getCollaborations = (idea_id, callback) => {
    db.all(`SELECT * FROM collaborations WHERE idea_id = ?`, [idea_id], (err, rows) => {
        callback(err, rows);
    });
};


// Add a new comment
exports.addComment = (userId, ideaId, comment, callback) => {
    db.run(
        `INSERT INTO comments (idea_id, user_id, comment) VALUES (?, ?, ?)`,
        [ideaId, userId, comment],
        function (err) {
            if (err) return callback(err);
            db.get(`SELECT * FROM comments WHERE id = ?`, [this.lastID], (err, row) => {
                callback(err, row);
            });
        }
    );
};

// Get all comments for an idea
exports.getCommentsByIdea = (ideaId, callback) => {
    db.all(
        `SELECT comments.*, users.name AS user_name
         FROM comments
         JOIN users ON comments.user_id = users.id
         WHERE idea_id = ?
         ORDER BY created_at DESC`,
        [ideaId],
        (err, rows) => {
            callback(err, rows);
        }
    );
};