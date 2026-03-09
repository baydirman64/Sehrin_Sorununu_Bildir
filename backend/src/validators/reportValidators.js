// backend/src/validators/reportValidators.js
const { z } = require("zod");

const createReportSchema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter olmalı"),
  category: z.enum(["road", "lighting", "water", "garbage", "park", "other"]),
  danger_level: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().optional(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  address: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["pending", "in_progress", "resolved", "rejected"]),
});

const addNoteSchema = z.object({
  note: z.string().min(2, "Not en az 2 karakter olmalı"),
});

module.exports = { createReportSchema, updateStatusSchema, addNoteSchema };