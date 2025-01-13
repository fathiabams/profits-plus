// middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../model/user");

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]; // Extract token part
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const decodeduser = await User.findById(decoded.id).select("-password");
            req.auth = decodeduser._id; // Attach the user's ID to the request object
            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                // Token has expired
                res.status(401).json({ message: "Session expired. Please log in again." });
            } else {
                // Other JWT verification errors
                res.status(401).json({ message: "Not authorized, token failed" });
            }
        }
    } else {
        res.status(401).json({ message: "Not authorized, token missing" });
    }
});

module.exports = { protect };
