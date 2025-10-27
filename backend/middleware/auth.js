const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "subscription_secret_key_2024";

function generateToken(userId, email) {
  return jwt.sign({ userId, email }, SECRET, { expiresIn: "7d" });
}

function validateToken(req, res, next) {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = {
  generateToken,
  validateToken,
};