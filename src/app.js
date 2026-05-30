const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const kuisRoutes = require("./routes/kuis.routes");
const soalRoutes = require("./routes/soal.routes");
const modulRoutes = require("./routes/modul.routes");
const hasilRoutes = require("./routes/hasil.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const aiRoutes = require("./routes/ai.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/kuis", kuisRoutes);
app.use("/api/soal", soalRoutes);
app.use("/api/modul", modulRoutes);
app.use("/api/hasil", hasilRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);

module.exports = app;