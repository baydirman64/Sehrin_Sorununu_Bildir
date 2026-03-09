const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const reportController = require("../controllers/reportController");

// Bu router altındaki her şey sadece authority/admin
router.use(auth, role(["authority", "admin"]));

router.get("/", reportController.listAll);        // /api/admin/reports
router.get("/map", reportController.mapItems);    // /api/admin/reports/map
router.patch("/:id/status", reportController.updateStatus);
router.post("/:id/note", reportController.addNote);

module.exports = router;