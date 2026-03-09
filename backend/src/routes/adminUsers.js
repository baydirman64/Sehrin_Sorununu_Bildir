const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const adminUserController = require("../controllers/adminUserController");

router.post(
  "/authority",
  auth,
  role(["admin"]),
  adminUserController.createAuthority
);

module.exports = router;