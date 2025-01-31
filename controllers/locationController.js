const locationModel = require('../models/locationModel');

// Create a new location
exports.createLocation = (req, res) => {
    const { name, type, parent_id } = req.body;
    // Validate input
    if (!name || !type) {
        return res.status(400).json({ message: 'Name and type are required' });
    }

    // Validate type
    if (!['region', 'country', 'branch'].includes(type)) {
        return res.status(400).json({ message: 'Invalid type. Must be region, country, or branch' });
    }

    // Enforce parent_id validation
    if (type !== 'region' && !parent_id) {
        return res.status(400).json({ message: `${type} must have a valid parent_id.` });
    }

    // If parent_id is provided, validate that it exists
    if (parent_id) {
        locationModel.getLocationById(parent_id, (err, parent) => {
            if (err) {
                return res.status(500).json({ message: 'Error validating parent_id', error: err.message });
            }
            if (!parent) {
                return res.status(400).json({ message: 'Invalid parent_id. Parent location does not exist.' });
            }

            // Proceed to create location after validation
            locationModel.createLocation({ name, type, parent_id }, (err, location) => {
                if (err) {
                    return res.status(500).json({ message: 'Error creating location', error: err.message });
                }
                res.status(201).json({ message: 'Location created successfully', location });
            });
        });
    } else {
        // No parent_id provided (only valid for regions)
        locationModel.createLocation({ name, type, parent_id: null }, (err, location) => {
            if (err) {
                return res.status(500).json({ message: 'Error creating location', error: err.message });
            }
            res.status(201).json({ message: 'Location created successfully', location });
        });
    }
};

// Retrieve all locations
exports.getAllLocations = (req, res) => {
    locationModel.getAllLocations((err, locations) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching locations', error: err.message });
        }
        res.json(locations);
    });
};

// Retrieve a single location by ID
exports.getLocationById = (req, res) => {
    const { id } = req.params;

    locationModel.getLocationById(id, (err, location) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching location', error: err.message });
        }
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }
        res.json(location);
    });
};

// Update a location
exports.updateLocation = (req, res) => {
    const { id } = req.params;
    const { name, type, parent_id } = req.body;

    // Validate input
    if (!name || !type) {
        return res.status(400).json({ message: 'Name and type are required' });
    }

    // Validate type
    if (!['region', 'country', 'branch'].includes(type)) {
        return res.status(400).json({ message: 'Invalid type. Must be region, country, or branch' });
    }

    locationModel.updateLocation(id, { name, type, parent_id }, (err, location) => {
        if (err) {
            return res.status(500).json({ message: 'Error updating location', error: err.message });
        }
        res.json({ message: 'Location updated successfully', location });
    });
};

// Delete a location

exports.deleteLocation = (req, res) => {
    const { id } = req.params;

    locationModel.getLocationById(id, (err, location) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching location', error: err.message });
        }
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }
        locationModel.deleteLocation(id, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error deleting location', error: err.message });
            }
            res.json(result);
        });
    });
};

// exports.deleteLocation = (req, res) => {
//     const { id } = req.params;
//     locationModel.deleteLocation(id, (err, result) => {
//         if (err) {
//             return res.status(500).json({ message: 'Error deleting location', error: err.message });
//         }
//         res.json(result);
//     });
// };
