const express = require('express');
const locationController = require('../controllers/locationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Routes
router.post('/', authMiddleware, locationController.createLocation); // Create a new location
router.get('/', authMiddleware, locationController.getAllLocations); // Retrieve all locations
router.get('/:id', authMiddleware, locationController.getLocationById); // Retrieve a location by ID
router.put('/:id', authMiddleware, locationController.updateLocation); // Update a location
router.delete('/:id', authMiddleware, locationController.deleteLocation); // Delete a location

module.exports = router;
