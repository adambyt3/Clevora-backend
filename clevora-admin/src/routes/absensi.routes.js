const express = require("express");
const api = require("../config/api.config");
const { requireAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

// GET /absensi (Show attendance grid)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { kelas, bulan, tahun } = req.query;
    const now = new Date();
    const queryKelas = kelas || "6A"; // default to 6A
    const queryBulan = bulan || String(now.getMonth() + 1); // 1-indexed for view
    const queryTahun = tahun || String(now.getFullYear());

    const response = await api.get(`/absensi?kelas=${queryKelas}&bulan=${queryBulan}&tahun=${queryTahun}`);
    const { siswa, logs } = response.data.data;

    res.render("absensi/index", {
      title: "Rekap Absensi - Clevora Admin",
      path: "/absensi",
      siswa,
      logs,
      kelas: queryKelas,
      bulan: queryBulan,
      tahun: queryTahun
    });
  } catch (error) {
    console.error("Attendance grid error:", error.message);
    res.render("absensi/index", {
      title: "Rekap Absensi - Clevora Admin",
      path: "/absensi",
      siswa: [],
      logs: [],
      kelas: "6A",
      bulan: String(new Date().getMonth() + 1),
      tahun: String(new Date().getFullYear()),
      error: "Gagal mengambil data absensi dari server."
    });
  }
});

// POST /absensi (Submit / Update attendance today)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { records, kelas, tanggal } = req.body;
    await api.post("/absensi", { records, kelas, tanggal });

    req.flash("success", "Absensi hari ini berhasil disimpan.");
    res.redirect(`/absensi?kelas=${kelas}`);
  } catch (error) {
    console.error("Submit attendance error:", error.message);
    req.flash("error", "Gagal menyimpan absensi hari ini.");
    res.redirect("/absensi");
  }
});

module.exports = router;
