const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpService = require("../services/otpService");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  const { idToken, role } = req.body;
  try {
    // 1. Verifikasi ID Token secara aman menggunakan Google API
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    // 2. Cek apakah user dengan email tersebut sudah terdaftar di MongoDB Atlas
    let user = await User.findOne({ email });
    if (!user) {
      // Jika belum terdaftar, buat akun baru secara dinamis dengan password terenkripsi aman
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      user = new User({
        nama: name,
        email: email,
        role: role || 'siswa', // Default role dari seleksi UI frontend
        password: hashedPassword,
        is_verified: true // Email Google terbukti valid
      });
      await user.save();
    }
    // 3. Buat JWT Token lokal untuk Clevora
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(200).json({
      success: true,
      message: 'Login Google berhasil',
      token,
      user: {
        id: user._id,
        nama: user.nama,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token Google tidak valid atau kadaluwarsa',
      error: error.message
    });
  }
}
exports.register = async (req, res) => {
  try {
    const {
      nama,
      email,
      password,
      role,
      nip,
      nisn,
      kelas,
      sekolah,
      mapel,
      jenjang,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate random 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const userData = {
      nama,
      email,
      password: hashedPassword,
      role,
      otp,
      otp_expiry,
      is_verified: false,
    };

    if (role === 'guru') {
      userData.nip = nip;
      userData.mapel = mapel;
      userData.jenjang = jenjang;
    } else {
      userData.nisn = nisn;
      userData.kelas = kelas;
      userData.sekolah = sekolah;
    }

    const user = await User.create(userData);

    // Send OTP email
    await otpService.sendOtp(email, otp);

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otp_expiry;

    res.status(201).json({
      success: true,
      message: "Register berhasil. Silakan cek email untuk kode OTP verifikasi.",
      data: {
        user: userResponse,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // Role validation
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Akun Anda terdaftar sebagai ${user.role}, bukan ${role}.`,
      });
    }

    // OTP verification check
    if (!user.is_verified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otp_expiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      
      await otpService.sendOtp(email, otp);

      return res.status(403).json({
        success: false,
        message: "Akun Anda belum diverifikasi. Kode OTP baru telah dikirim ke email Anda.",
        unverified: true,
        email: email,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET || "clevora_secret_key",
      {
        expiresIn: "7d",
      }
    );

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otp_expiry;

    res.status(200).json({
      success: true,
      message: "Selamat datang kembali",
      data: {
        token,
        user: userResponse,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Akun ini sudah diverifikasi sebelumnya",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Kode OTP salah",
      });
    }

    if (new Date() > user.otp_expiry) {
      return res.status(400).json({
        success: false,
        message: "Kode OTP telah kadaluarsa. Silakan minta kode baru.",
      });
    }

    user.is_verified = true;
    user.otp = undefined;
    user.otp_expiry = undefined;
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET || "clevora_secret_key",
      {
        expiresIn: "7d",
      }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Akun berhasil diverifikasi",
      data: {
        token,
        user: userResponse,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Akun ini sudah diverifikasi sebelumnya",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otp_expiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await otpService.sendOtp(email, otp);

    res.status(200).json({
      success: true,
      message: "Kode OTP baru berhasil dikirim ke email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Profil user berhasil didapatkan",
      data: {
        user: req.user,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};