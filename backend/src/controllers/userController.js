// backend/src/controllers/userController.js
const userRepo = require("../repositories/userRepository");
const ApiError = require("../utils/Apierror");

exports.me = async (req, res, next) => {
  try {
    const user = await userRepo.findById(req.user.id);
    if (!user) throw new ApiError(404, "Kullanıcı bulunamadı");

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};