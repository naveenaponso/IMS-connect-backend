const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');

const userRoutes = require('./routes/userRoutes');
const locationRoutes = require('./routes/locationRoutes');

const fs = require('fs');
const path = require('path');


const app = express();

const PORT = 5000;

app.use(cors());

app.use(bodyParser.json());

const db = require('./db'); // Import the shared database connection

// Initialize tables by executing the SQL script
const initializeDatabase = () => {
    const sqlScript = fs.readFileSync(path.join(__dirname, 'initializeDB.sql'), 'utf-8');
    db.exec(sqlScript, (err) => {
        if (err) {
            console.error('Failed to initialize database:', err.message);
        } else {
            console.log('Database tables initialized successfully');
        }
    });
};

initializeDatabase()

// Routes
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
