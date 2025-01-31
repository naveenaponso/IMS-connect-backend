const express = require('express');
const locationController = require('../controllers/locationController');

const router = express.Router();

// Routes
router.post('/', locationController.createLocation); // Create a new location
router.get('/', locationController.getAllLocations); // Retrieve all locations
router.get('/:id', locationController.getLocationById); // Retrieve a location by ID
router.put('/:id', locationController.updateLocation); // Update a location
router.delete('/:id', locationController.deleteLocation); // Delete a location

module.exports = router;
