const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["guru", "siswa"],
      required: true,
    },

    nip: String,
    nisn: String,

    mapel: String,
    jenjang: String,

    kelas: String,
    sekolah: String,

    foto_wajah_url: String,

    sudah_daftar_wajah: {
      type: Boolean,
      default: false,
    },

    is_verified: {
      type: Boolean,
      default: false,
    },

    fcm_token: String,

    otp: String,

    otp_expiry: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);