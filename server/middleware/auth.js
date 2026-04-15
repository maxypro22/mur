const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.id });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        console.log(`👤 Auth - User: ${user.email}, Role: ${user.role}, FirmID: ${user.lawFirmId}`);
        next();
    } catch (error) {
        console.error('Authentication Error:', error.message);
        // If it helps debugging:
        if (req.header('Authorization')) {
            console.error('Token received (partial):', req.header('Authorization').substring(0, 20) + '...');
        } else {
            console.error('No Authorization header received');
        }
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).send({ error: 'Access denied.' });
        }
        next();
    };
};

module.exports = { auth, checkRole };
