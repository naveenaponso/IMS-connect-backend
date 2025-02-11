const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const SECRET_KEY = 'IMS-12345'; // Replace with a secure key

// Register a new user
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        userModel.createUser({ name, email, password: hashedPassword }, (err, user) => {
            if (err) {
                if (err.message === "Email not found in HR system") {
                    return res.status(400).json({ message: "Email not found in the HR system." });
                }
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ message: "Email already registered" });
                }

                return res.status(500).json({ message: "Database error", error: err.message });
            }
            res.status(201).json({ message: "User registered successfully", user });
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        userModel.findUserByEmail(email, async (err, user) => {
            if (err || !user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate JWT
            const token = jwt.sign({ id: user.id, role: user.role, email:user.name }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ message: 'Login successful', token });
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Get user profile
exports.getProfile = (req, res) => {
    const userId = req.user.id;
    userModel.findUserById(userId, (err, user) => {
        if (err) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    });
};

// Update user profile
exports.updateProfile = (req, res) => {
    const userId = req.user.id;
    const { name, location_id } = req.body;

    userModel.updateUser(userId, { name, location_id }, (err, updatedUser) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to update profile', error: err });
        }
        res.json({ message: 'Profile updated successfully', updatedUser });
    });
};
