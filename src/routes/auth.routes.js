const express = require("express");
const {
  register,
  login,
  verifyOtp,
  resendOtp,
  getMe,
  googleLogin,
  getSiswaList,
  getGuruList,
  updateUser,
  deleteUser,
  getStats,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.get("/me", authMiddleware, getMe);

// Admin / Teacher CRUD & Dashboard endpoints
router.get("/siswa-list", authMiddleware, getSiswaList);
router.get("/guru-list", authMiddleware, getGuruList);
router.put("/update/:id", authMiddleware, updateUser);
router.delete("/delete/:id", authMiddleware, deleteUser);
router.get("/stats", authMiddleware, getStats);

module.exports = router;
