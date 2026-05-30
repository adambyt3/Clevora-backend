require("dotenv").config();
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const morgan = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const path = require("path");

const app = express();

// View engine configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "src/public")));

// Session & Flash notifications
app.use(
  session({
    secret: process.env.SESSION_SECRET || "clevora_admin_session_rahasia_teraman_2026",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day validity
  })
);
app.use(flash());

// Pass notification messages and auth details to all EJS templates
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.admin = (req.session && req.session.admin) ? req.session.admin : null;
  next();
});

// Admin app routes
app.use("/", require("./src/routes/auth.routes"));
app.use("/dashboard", require("./src/routes/dashboard.routes"));
app.use("/siswa", require("./src/routes/siswa.routes"));
app.use("/guru", require("./src/routes/guru.routes"));
app.use("/nilai", require("./src/routes/nilai.routes"));
app.use("/kuis", require("./src/routes/kuis.routes"));
app.use("/pelanggaran", require("./src/routes/pelanggaran.routes"));
app.use("/absensi", require("./src/routes/absensi.routes"));

// 404 Route handler
app.use((req, res) => {
  res.status(404).render("404", { layout: false, title: "404 - Halaman Tidak Ditemukan" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Clevora Admin running at http://localhost:${PORT}`);
});
