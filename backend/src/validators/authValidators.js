// backend/src/validators/authValidators.js
const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Email formatı hatalı"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

const loginSchema = z.object({
  email: z.string().email("Email formatı hatalı"),
  password: z.string().min(1, "Şifre gerekli"),
});

module.exports = { registerSchema, loginSchema };