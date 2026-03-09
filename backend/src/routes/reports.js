const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const upload = require("../config/multer");
const reportController = require("../controllers/reportController");

// Vatandaş: şikayet oluştur (foto alan adı: photo)
router.post("/", auth, upload.single("photo"), reportController.create);

// Vatandaş: benim şikayetlerim
router.get("/my", auth, reportController.getMine);

// Detay (vatandaş sadece kendi raporu; yetkili her raporu görebilir)
router.get("/:id", auth, reportController.getById);

module.exports = router;