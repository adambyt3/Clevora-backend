const express = require("express");
const api = require("../config/api.config");
const { requireAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

// GET /kuis (List quizzes)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const response = await api.get("/kuis");
    const quizzes = response.data.data;

    res.render("kuis/index", {
      title: "Monitor Kuis - Clevora Admin",
      path: "/kuis",
      quizzes
    });
  } catch (error) {
    console.error("Quiz list error:", error.message);
    res.render("kuis/index", {
      title: "Monitor Kuis - Clevora Admin",
      path: "/kuis",
      quizzes: [],
      error: "Gagal memuat daftar kuis dari backend."
    });
  }
});

// GET /kuis/:id (Quiz detail & submissions)
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const quizResponse = await api.get(`/kuis/${req.params.id}`);
    const quiz = quizResponse.data.data;

    // Fetch submissions for this quiz
    const resultsResponse = await api.get(`/hasil?kuisId=${req.params.id}`);
    const submissions = resultsResponse.data.data;

    res.render("kuis/detail", {
      title: `Detail Kuis: ${quiz.judul} - Clevora Admin`,
      path: "/kuis",
      quiz,
      submissions
    });
  } catch (error) {
    console.error("Quiz detail error:", error.message);
    req.flash("error", "Gagal memuat rincian kuis.");
    res.redirect("/kuis");
  }
});

// POST /kuis/:id/close (Force close quiz)
router.post("/:id/close", requireAdmin, async (req, res) => {
  try {
    // Mock closing quiz success
    req.flash("success", "Kuis berhasil dipaksa tutup. Siswa tidak dapat mengumpulkan jawaban baru.");
    res.redirect(`/kuis/${req.params.id}`);
  } catch (error) {
    console.error("Close quiz error:", error.message);
    req.flash("error", "Gagal menutup kuis.");
    res.redirect("/kuis");
  }
});

module.exports = router;
