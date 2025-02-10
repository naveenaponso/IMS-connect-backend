const db = require('../db'); // Import the shared database connection

// Create a user
exports.createUser = (user, callback) => {
    const { name, email, password } = user;

    // Check if email exists in HR_Employees and fetch role & location_id
    db.get(`SELECT role, location_id FROM HR_Employees WHERE email = ?`, [email], (err, row) => {
        if (err) return callback(err);
        if (!row) return callback(new Error("Email not found in HR system"));

        console.log("HR Record Found:", row);

        const { role, location_id } = row; // Assign role & location_id from HR_Employees

        // Insert user into users table
        db.run(
            `INSERT INTO users (name, email, password, role, location_id) VALUES (?, ?, ?, ?, ?)`,
            [name, email, password, role, location_id],
            function (err) {
                if (err) return callback(err);
                callback(null, { id: this.lastID, name, email, role, location_id }); // Return new user
            }
        );
    });
};



// Find a user by email
exports.findUserByEmail = (email, callback) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
        callback(err, row); // Return the user or error
    });
};

//find user  by id
exports.findUserById = (id, callback) => {
    db.get(
        `WITH LocationHierarchy AS (
            -- Recursively get the branch, country, and region
            SELECT 
                l1.id AS branch_id, l1.name AS branch_name,
                l2.id AS country_id, l2.name AS country_name,
                l3.id AS region_id, l3.name AS region_name
            FROM locations l1
            LEFT JOIN locations l2 ON l1.parent_id = l2.id AND l1.type = 'branch'
            LEFT JOIN locations l3 ON l2.parent_id = l3.id AND l2.type = 'country'
            WHERE l1.id = (SELECT location_id FROM users WHERE id = ?)
        )
        SELECT 
            users.id, 
            users.name, 
            users.email, 
            users.role, 
            users.location_id, 
            users.created_at,
            HR_Employees.birthdate,
            HR_Employees.phone,
            HR_Employees.hire_date,
            lh.branch_id, lh.branch_name,
            lh.country_id, lh.country_name,
            lh.region_id, lh.region_name
        FROM users
        LEFT JOIN HR_Employees ON users.email = HR_Employees.email
        LEFT JOIN LocationHierarchy lh ON users.location_id = lh.branch_id
        WHERE users.id = ?`,
        [id, id],  // Pass ID twice for the CTE and main query
        (err, row) => {
            callback(err, row); // Return the combined user profile or error
        }
    );
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
