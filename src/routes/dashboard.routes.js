const express = require("express");
const { getTeacherStats, getStudentStats } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/teacher", authMiddleware, roleMiddleware("guru"), getTeacherStats);
router.get("/student", authMiddleware, roleMiddleware("siswa"), getStudentStats);

module.exports = router;
