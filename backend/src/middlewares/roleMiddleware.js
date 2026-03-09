// backend/src/middlewares/roleMiddleware.js
const ApiError = require("../utils/Apierror");

module.exports = function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, "Önce giriş yapmalısın"));

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "Bu işlem için yetkin yok"));
    }

    next();
  };
};