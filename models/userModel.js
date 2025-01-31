const db = require('../db'); // Import the shared database connection

// Create a user
exports.createUser = (user, callback) => {
    const { name, email, password, role, location_id } = user;
    db.run(
        `INSERT INTO users (name, email, password, role, location_id) VALUES (?, ?, ?, ?, ?)`,
        [name, email, password, role, location_id],
        function (err) {
            if (err) return callback(err); // Handle errors
            callback(null, { id: this.lastID, ...user }); // Return the new user
        }
    );
};

// Find a user by email
exports.findUserByEmail = (email, callback) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
        callback(err, row); // Return the user or error
    });
};

// Find a user by ID
exports.findUserById = (id, callback) => {
    db.get(`SELECT id, name, email, role, location_id, created_at FROM users WHERE id = ?`, [id], (err, row) => {
        callback(err, row); // Return the user or error
    });
};

// Update user details
exports.updateUser = (id, updatedFields, callback) => {
    const { name, location_id } = updatedFields;
    db.run(
        `UPDATE users SET name = ?, location_id = ? WHERE id = ?`,
        [name, location_id, id],
        function (err) {
            if (err) return callback(err); // Handle errors
            callback(null, { id, ...updatedFields }); // Return the updated user
        }
    );
};
