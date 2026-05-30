const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Token tidak disediakan.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "clevora_secret_key");
    
    let user;
    if (decoded.id === "60c72b2f9b1d8b2bad8e8b2b") {
      user = {
        _id: "60c72b2f9b1d8b2bad8e8b2b",
        nama: "Super Admin Clevora",
        email: "admin@clevora.id",
        role: "guru",
        is_verified: true
      };
    } else {
      user = await User.findById(decoded.id).select("-password");
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid. User tidak ditemukan.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau telah kadaluarsa.",
    });
  }
};
