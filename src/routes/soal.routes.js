const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Get questions by quiz ID (Protected)
router.get("/:quizId", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: `Akses Berhasil: Mendapatkan soal kuis dengan ID: ${req.params.quizId}`,
    data: [],
  });
});

// Create question for a quiz (Protected, Guru only)
router.post("/", authMiddleware, roleMiddleware("guru"), (req, res) => {
  res.status(201).json({
    success: true,
    message: "Akses Berhasil: Soal kuis berhasil ditambahkan (Guru)",
  });
});

module.exports = router;
