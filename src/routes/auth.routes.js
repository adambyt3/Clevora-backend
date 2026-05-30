const express = require("express");
const {
  register,
  login,
  verifyOtp,
  resendOtp,
  getMe,
  googleLogin,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.get("/me", authMiddleware, getMe);

module.exports = router;
