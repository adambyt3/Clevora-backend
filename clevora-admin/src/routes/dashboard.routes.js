const express = require("express");
const api = require("../config/api.config");
const { requireAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

// GET /dashboard
router.get("/", requireAdmin, async (req, res) => {
  try {
    const response = await api.get("/auth/stats");
    const statsData = response.data.data;

    res.render("dashboard/index", {
      title: "Dashboard Utama - Clevora Admin",
      path: "/dashboard",
      stats: statsData
    });
  } catch (error) {
    console.error("Dashboard stats error:", error.message);
    
    // Fallback Mock Data if Backend or DB is unavailable
    const fallbackStats = {
      totalSiswa: 36,
      totalGuru: 12,
      totalKuis: 8,
      rerataNilai: 82.5,
      latestQuizzes: [
        { judul: "Kuis Aljabar Dasar", mapel: "Matematika", kelas: "6A", createdAt: new Date() },
        { judul: "Pretest Struktur Sel", mapel: "IPA", kelas: "6B", createdAt: new Date() },
        { judul: "Postest Proklamasi", mapel: "IPS", kelas: "6C", createdAt: new Date() }
      ],
      underperforming: [
        { siswa: { nama: "Budi Santoso", kelas: "6A" }, kuis: { judul: "Kuis Aljabar Dasar" }, nilai: 55 },
        { siswa: { nama: "Siti Rahma", kelas: "6B" }, kuis: { judul: "Pretest Struktur Sel" }, nilai: 60 }
      ]
    };

    res.render("dashboard/index", {
      title: "Dashboard Utama - Clevora Admin (Fallback)",
      path: "/dashboard",
      stats: fallbackStats,
      warning: "Koneksi backend gagal. Menampilkan data simulasi."
    });
  }
});

module.exports = router;
