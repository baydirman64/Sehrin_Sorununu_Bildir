const crypto = require("crypto");

// Her isteğe benzersiz ID veriyoruz: log takibi kolaylaşır.
module.exports = function requestId(req, res, next) {
  const id = crypto.randomUUID();
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
};