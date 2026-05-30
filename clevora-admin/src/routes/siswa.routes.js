const express = require("express");
const api = require("../config/api.config");
const { requireAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

// GET /siswa (List)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const response = await api.get("/auth/siswa-list");
    res.render("siswa/index", {
      title: "Manajemen Siswa - Clevora Admin",
      path: "/siswa",
      siswa: response.data.data
    });
  } catch (error) {
    console.error("Siswa list error:", error.message);
    res.render("siswa/index", {
      title: "Manajemen Siswa - Clevora Admin",
      path: "/siswa",
      siswa: [],
      error: "Gagal mengambil data siswa dari server."
    });
  }
});

// GET /siswa/tambah (Form)
router.get("/tambah", requireAdmin, (req, res) => {
  res.render("siswa/tambah", {
    title: "Tambah Siswa Baru - Clevora Admin",
    path: "/siswa"
  });
});

// POST /siswa/tambah
router.post("/tambah", requireAdmin, async (req, res) => {
  try {
    const { nama, email, password, nisn, kelas, sekolah } = req.body;
    
    // Register uses the /register API in the backend
    await api.post("/auth/register", {
      nama,
      email,
      password,
      role: "siswa",
      nisn,
      kelas,
      sekolah
    });

    req.flash("success", "Siswa baru berhasil didaftarkan dan dikirimi OTP.");
    res.redirect("/siswa");
  } catch (error) {
    console.error("Add siswa error:", error.response?.data || error.message);
    req.flash("error", error.response?.data?.message || "Gagal menambahkan siswa baru.");
    res.redirect("/siswa/tambah");
  }
});

// GET /siswa/edit/:id (Form)
router.get("/edit/:id", requireAdmin, async (req, res) => {
  try {
    const response = await api.get("/auth/siswa-list");
    const target = response.data.data.find(s => s._id === req.params.id);

    if (!target) {
      req.flash("error", "Siswa tidak ditemukan.");
      return res.redirect("/siswa");
    }

    res.render("siswa/edit", {
      title: "Edit Siswa - Clevora Admin",
      path: "/siswa",
      target
    });
  } catch (error) {
    console.error("Edit form siswa error:", error.message);
    req.flash("error", "Gagal memuat data detail siswa.");
    res.redirect("/siswa");
  }
});

// PUT /siswa/edit/:id
router.put("/edit/:id", requireAdmin, async (req, res) => {
  try {
    const { nama, email, password, nisn, kelas, sekolah } = req.body;
    const updatePayload = { nama, email, role: "siswa", nisn, kelas, sekolah };

    if (password && password.trim() !== "") {
      updatePayload.password = password;
    }

    await api.put(`/auth/update/${req.params.id}`, updatePayload);

    req.flash("success", "Data siswa berhasil diperbarui.");
    res.redirect("/siswa");
  } catch (error) {
    console.error("Update siswa error:", error.response?.data || error.message);
    req.flash("error", error.response?.data?.message || "Gagal memperbarui data siswa.");
    res.redirect(`/siswa/edit/${req.params.id}`);
  }
});

// DELETE /siswa/delete/:id
router.delete("/delete/:id", requireAdmin, async (req, res) => {
  try {
    await api.delete(`/auth/delete/${req.params.id}`);
    req.flash("success", "Siswa berhasil dihapus dari sistem.");
    res.redirect("/siswa");
  } catch (error) {
    console.error("Delete siswa error:", error.message);
    req.flash("error", "Gagal menghapus data siswa.");
    res.redirect("/siswa");
  }
});

module.exports = router;
