const bcrypt = require("bcryptjs");
const ApiError = require("../utils/Apierror");
const userRepo = require("../repositories/userRepository");
const { z } = require("zod");

const createAuthoritySchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Email formatı hatalı"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

exports.createAuthority = async (req, res, next) => {
  try {
    const parsed = createAuthoritySchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(422, parsed.error.issues[0].message);

    const { name, email, password } = parsed.data;

    const existing = await userRepo.findByEmail(email);
    if (existing) throw new ApiError(409, "Bu email zaten kayıtlı");

    const password_hash = await bcrypt.hash(password, 10);

    const id = await userRepo.createUser({
      name,
      email,
      password_hash,
      role: "authority",
    });

    res.status(201).json({
      success: true,
      message: "Yetkili kullanıcı oluşturuldu",
      user: { id, name, email, role: "authority" },
    });
  } catch (err) {
    next(err);
  }
};