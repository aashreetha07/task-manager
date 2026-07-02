const jwt = require('jsonwebtoken');

// This function runs BEFORE protected routes
// It checks if the request has a valid JWT token
const protect = (req, res, next) => {
  try {
    // Get token from request header
    // Frontend sends: Authorization: Bearer <token>
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token, access denied' });
    }

    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach userId to request so routes can use it
    req.userId = decoded.userId;

    next(); // move on to the actual route
  } catch (err) {
    res.status(401).json({ message: 'Token is invalid' });
  }
};

module.exports = protect;