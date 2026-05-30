const express = require("express");
const api = require("../config/api.config");
const { requireAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

// GET /pelanggaran (List CV FaceNet violations)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const response = await api.get("/hasil?filter=pelanggaran");
    const results = response.data.data;

    res.render("pelanggaran/index", {
      title: "Log Pelanggaran CV Proctoring - Clevora Admin",
      path: "/pelanggaran",
      results
    });
  } catch (error) {
    console.error("Proctoring log error:", error.message);
    res.render("pelanggaran/index", {
      title: "Log Pelanggaran CV Proctoring - Clevora Admin",
      path: "/pelanggaran",
      results: [],
      error: "Gagal mengambil log proctoring pelanggaran dari server."
    });
  }
});

module.exports = router;
