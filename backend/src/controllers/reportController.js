const ApiError = require("../utils/Apierror");
const reportRepo = require("../repositories/reportRepository");
const noteRepo = require("../repositories/noteRepository");
const statusLogRepo = require("../repositories/statusLogRepository");

const { z } = require("zod");

// Validasyonlar (tek dosyada toparladım ki karışmasın)
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

exports.create = async (req, res, next) => {
  try {
    const parsed = createReportSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(422, parsed.error.issues[0].message);

    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

    const reportId = await reportRepo.createReport({
      user_id: req.user.id,
      ...parsed.data,
      photo_url,
    });

    const report = await reportRepo.findById(reportId);

    res.status(201).json({
      success: true,
      message: "Şikayet oluşturuldu",
      report,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMine = async (req, res, next) => {
  try {
    const items = await reportRepo.listMine(req.user.id);
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const report = await reportRepo.findById(id);
    if (!report) throw new ApiError(404, "Şikayet bulunamadı");

    const isAuthority = ["authority", "admin"].includes(req.user.role);
    if (!isAuthority && report.user_id !== req.user.id) {
      throw new ApiError(403, "Bu şikayeti görme yetkin yok");
    }

    const notes = await noteRepo.listNotes(id);
    const statusLogs = await statusLogRepo.listByReport(id);

    res.json({ success: true, report, notes, statusLogs });
  } catch (err) {
    next(err);
  }
};

// Admin/Authority: filtre + pagination
exports.listAll = async (req, res, next) => {
  try {
    const data = await reportRepo.listAll(req.query);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

// Admin/Authority: harita marker datası
exports.mapItems = async (req, res, next) => {
  try {
    const items = await reportRepo.listMapItems(req.query);
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

// Admin/Authority: durum güncelle + audit log
exports.updateStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(422, parsed.error.issues[0].message);

    const report = await reportRepo.findById(id);
    if (!report) throw new ApiError(404, "Şikayet bulunamadı");

    const oldStatus = report.status;
    const newStatus = parsed.data.status;

    if (oldStatus === newStatus) {
      return res.json({ success: true, message: "Durum zaten bu şekilde" });
    }

    await reportRepo.updateStatus(id, newStatus);

    await statusLogRepo.addLog({
      report_id: id,
      changed_by: req.user.id,
      old_status: oldStatus,
      new_status: newStatus,
    });

    res.json({ success: true, message: "Durum güncellendi" });
  } catch (err) {
    next(err);
  }
};

// Admin/Authority: not ekle
exports.addNote = async (req, res, next) => {
  try {
    const reportId = Number(req.params.id);
    const parsed = addNoteSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(422, parsed.error.issues[0].message);

    const report = await reportRepo.findById(reportId);
    if (!report) throw new ApiError(404, "Şikayet bulunamadı");

    await noteRepo.addNote({
      report_id: reportId,
      authority_id: req.user.id,
      note: parsed.data.note,
    });

    res.status(201).json({ success: true, message: "Not eklendi" });
  } catch (err) {
    next(err);
  }
};