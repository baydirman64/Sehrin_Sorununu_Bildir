// backend/src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/Apierror");

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Token gerekli (Bearer token)"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, email }
    next();
  } catch (err) {
    next(new ApiError(401, "Geçersiz veya süresi dolmuş token"));
  }
};