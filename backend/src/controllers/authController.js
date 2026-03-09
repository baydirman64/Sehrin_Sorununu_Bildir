// backend/src/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/Apierror");
const userRepo = require("../repositories/userRepository");
const { registerSchema, loginSchema } = require("../validators/authValidators");

function signToken(user) {
  // Token içine minimum gerekli veriyi koyuyoruz.
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

exports.register = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(422, parsed.error.issues[0].message);
    }

    const { name, email, password } = parsed.data;

    const existing = await userRepo.findByEmail(email);
    if (existing) throw new ApiError(409, "Bu email zaten kayıtlı");

    const password_hash = await bcrypt.hash(password, 10);

    // Güvenlik: register endpointinden role set ettirmiyoruz.
    const userId = await userRepo.createUser({ name, email, password_hash, role: "citizen" });

    const user = { id: userId, name, email, role: "citizen" };
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: "Kayıt başarılı",
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(422, parsed.error.issues[0].message);
    }

    const { email, password } = parsed.data;

    const user = await userRepo.findByEmail(email);
    if (!user) throw new ApiError(401, "Email veya şifre hatalı");

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new ApiError(401, "Email veya şifre hatalı");

    const token = signToken(user);

    res.json({
      success: true,
      message: "Giriş başarılı",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};