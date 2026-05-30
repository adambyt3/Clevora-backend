const express = require("express");
const api = require("../config/api.config");
const { requireAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

// GET /guru (List)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const response = await api.get("/auth/guru-list");
    res.render("guru/index", {
      title: "Manajemen Guru - Clevora Admin",
      path: "/guru",
      guru: response.data.data
    });
  } catch (error) {
    console.error("Guru list error:", error.message);
    res.render("guru/index", {
      title: "Manajemen Guru - Clevora Admin",
      path: "/guru",
      guru: [],
      error: "Gagal mengambil data guru dari server."
    });
  }
});

// GET /guru/tambah (Form)
router.get("/tambah", requireAdmin, (req, res) => {
  res.render("guru/tambah", {
    title: "Tambah Guru Baru - Clevora Admin",
    path: "/guru"
  });
});

// POST /guru/tambah
router.post("/tambah", requireAdmin, async (req, res) => {
  try {
    const { nama, email, password, nip, mapel, jenjang } = req.body;
    
    await api.post("/auth/register", {
      nama,
      email,
      password,
      role: "guru",
      nip,
      mapel,
      jenjang
    });

    req.flash("success", "Guru baru berhasil didaftarkan dan dikirimi OTP.");
    res.redirect("/guru");
  } catch (error) {
    console.error("Add guru error:", error.response?.data || error.message);
    req.flash("error", error.response?.data?.message || "Gagal menambahkan guru baru.");
    res.redirect("/guru/tambah");
  }
});

// GET /guru/edit/:id (Form)
router.get("/edit/:id", requireAdmin, async (req, res) => {
  try {
    const response = await api.get("/auth/guru-list");
    const target = response.data.data.find(g => g._id === req.params.id);

    if (!target) {
      req.flash("error", "Guru tidak ditemukan.");
      return res.redirect("/guru");
    }

    res.render("guru/edit", {
      title: "Edit Guru - Clevora Admin",
      path: "/guru",
      target
    });
  } catch (error) {
    console.error("Edit form guru error:", error.message);
    req.flash("error", "Gagal memuat data detail guru.");
    res.redirect("/guru");
  }
});

// PUT /guru/edit/:id
router.put("/edit/:id", requireAdmin, async (req, res) => {
  try {
    const { nama, email, password, nip, mapel, jenjang } = req.body;
    const updatePayload = { nama, email, role: "guru", nip, mapel, jenjang };

    if (password && password.trim() !== "") {
      updatePayload.password = password;
    }

    await api.put(`/auth/update/${req.params.id}`, updatePayload);

    req.flash("success", "Data guru berhasil diperbarui.");
    res.redirect("/guru");
  } catch (error) {
    console.error("Update guru error:", error.response?.data || error.message);
    req.flash("error", error.response?.data?.message || "Gagal memperbarui data guru.");
    res.redirect(`/guru/edit/${req.params.id}`);
  }
});

// DELETE /guru/delete/:id
router.delete("/delete/:id", requireAdmin, async (req, res) => {
  try {
    await api.delete(`/auth/delete/${req.params.id}`);
    req.flash("success", "Guru berhasil dihapus dari sistem.");
    res.redirect("/guru");
  } catch (error) {
    console.error("Delete guru error:", error.message);
    req.flash("error", "Gagal menghapus data guru.");
    res.redirect("/guru");
  }
});

module.exports = router;
