const express = require("express");
const { getAttendance, recordAttendance } = require("../controllers/absensiController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get attendance logs
router.get("/", authMiddleware, getAttendance);

// Record/update attendance logs
router.post("/", authMiddleware, recordAttendance);

module.exports = router;
