const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');

const userRoutes = require('./routes/userRoutes');
const locationRoutes = require('./routes/locationRoutes');
const ideaRoutes = require('./routes/ideaRoutes');
const collaborationRoutes = require("./routes/collaborationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const incentiveRoutes = require("./routes/incentiveRoutes");

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
app.use("/api/ideas", ideaRoutes);
app.use("/api/collaborations", collaborationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/incentives", incentiveRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
