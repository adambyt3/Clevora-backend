const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

// GET /login
router.get("/login", (req, res) => {
  if (req.session && req.session.admin) {
    return res.redirect("/dashboard");
  }
  res.render("auth/login", {
    layout: "layouts/auth",
    title: "Login Admin - Clevora",
    error: req.flash("error")
  });
});

// POST /login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL || "admin@clevora.id";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@Clevora2026";

  if (email === adminEmail && password === adminPassword) {
    const adminUser = {
      _id: "60c72b2f9b1d8b2bad8e8b2b",
      nama: "Super Admin Clevora",
      email: adminEmail,
      role: "admin"
    };

    // Store in session
    req.session.admin = adminUser;

    // Generate JWT token using backend secret (or default)
    const backendSecret = "clevora_secret_key";
    const token = jwt.sign(
      { id: adminUser._id, role: "guru" }, // mapped to guru on backend to allow queries
      backendSecret,
      { expiresIn: "7d" }
    );

    // Save token in global variable for axios config
    global.adminToken = token;

    req.flash("success", "Selamat datang kembali, Super Admin!");
    return res.redirect("/dashboard");
  }

  req.flash("error", "Email atau password administrator salah.");
  res.redirect("/login");
});

// GET /logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    global.adminToken = null;
    res.redirect("/login");
  });
});

module.exports = router;
