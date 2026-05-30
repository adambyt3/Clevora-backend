const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get quiz results for current user (Protected)
router.get("/", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: `Akses Berhasil: Mendapatkan data hasil belajar untuk user: ${req.user.nama}`,
    data: [],
  });
});

module.exports = router;
