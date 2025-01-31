const jwt = require('jsonwebtoken');
const SECRET_KEY = 'IMS-12345';

module.exports = (req, res, next) => {
    const token = req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};
