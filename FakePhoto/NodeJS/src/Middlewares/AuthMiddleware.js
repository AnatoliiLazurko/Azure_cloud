const jwt = require('jsonwebtoken');


module.exports.userVerification = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ message: 'No token' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token is invalid' });
        }

        req.user = decoded.user;
        next();

    });
};