const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Result = require("../models/Result");
const User = require("../models/User");

const router = express.Router();

// 1. Get results with optional filters (e.g. for violations or class)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { filter, kelas, kuisId } = req.query;
    let query = {};

    if (filter === "pelanggaran") {
      query = {
        $or: [
          { berakhir_paksa: true },
          { jumlah_peringatan: { $gt: 0 } },
          { "log_pelanggaran.0": { $exists: true } }
        ]
      };
    }

    if (kuisId) {
      query.kuis = kuisId;
    }

    // First fetch results and populate
    let results = await Result.find(query)
      .populate("siswa", "nama email kelas nisn")
      .populate({
        path: "kuis",
        select: "judul mapel deskripsi durasi",
        populate: { path: "guru", select: "nama" }
      })
      .sort({ createdAt: -1 });

    // Client-side or filter after populate if filtering by student class
    if (kelas) {
      results = results.filter(r => r.siswa && r.siswa.kelas === kelas);
    }

    res.status(200).json({
      success: true,
      message: "Data hasil belajar berhasil diambil",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 2. Get detailed results for a specific quiz (rekap)
router.get("/kuis/:kuisId", authMiddleware, async (req, res) => {
  try {
    const { kuisId } = req.params;
    const results = await Result.find({ kuis: kuisId })
      .populate("siswa", "nama email kelas nisn")
      .sort({ nilai: -1 });

    res.status(200).json({
      success: true,
      message: "Rekap nilai kuis berhasil diambil",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 3. Get overall rekap (class pretest/postest averages)
router.get("/rekap", authMiddleware, async (req, res) => {
  try {
    // Collect all results and calculate averages by class and quiz type
    const results = await Result.find()
      .populate("siswa", "nama kelas")
      .populate("kuis", "judul mapel");

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
