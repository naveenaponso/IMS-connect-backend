const db = require('../db');

// Create a new location
exports.createLocation = (location, callback) => {
    const { name, type, parent_id } = location;
    db.run(
        `INSERT INTO locations (name, type, parent_id) VALUES (?, ?, ?)`,
        [name, type, parent_id],
        function (err) {
            if (err) return callback(err);
            callback(null, { id: this.lastID, ...location });
        }
    );
};

// Retrieve all locations
exports.getAllLocations = (callback) => {
    db.all(`SELECT * FROM locations`, [], (err, rows) => {
        callback(err, rows);
    });
};

// Retrieve a single location by ID
exports.getLocationById = (id, callback) => {
    db.get(`SELECT * FROM locations WHERE id = ?`, [id], (err, row) => {
        callback(err, row);
    });
};

// Update a location
exports.updateLocation = (id, updatedFields, callback) => {
    const { name, type, parent_id } = updatedFields;
    db.run(
        `UPDATE locations SET name = ?, type = ?, parent_id = ? WHERE id = ?`,
        [name, type, parent_id, id],
        function (err) {
            if (err) return callback(err);
            callback(null, { id, ...updatedFields });
        }
    );
};

// Delete a location
exports.deleteLocation = (id, callback) => {
    db.run(`DELETE FROM locations WHERE id = ?`, [id], function (err) {
        if (err) return callback(err);
        callback(null, { message: 'Location deleted successfully' });
    });
};
