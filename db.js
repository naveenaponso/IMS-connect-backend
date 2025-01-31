const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(
    './database.db',
    (err) => {
        if (err) {
            console.error('Failed to connect to the database:', err.message);
            process.exit(1); // Exit if the database connection fails
        } else {
            console.log('Connected to SQLite database');
        }

    });


// Enable foreign key constraints
db.run('PRAGMA foreign_keys = ON;', (err) => {
    if (err) {
        console.error('Failed to enable foreign key constraints:', err.message);
    } else {
        console.log('Foreign key constraints are enabled.');
    }
});


module.exports = db;
