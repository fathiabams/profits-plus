const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).send({ message: 'Invalid token' });
    }
};


module.exports = { protect };