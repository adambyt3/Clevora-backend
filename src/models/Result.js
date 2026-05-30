const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    siswa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    kuis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    jawaban: [
      {
        soal: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        jawabanSiswa: {
          type: Number, // 0-indexed index
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],
    nilai: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    benar: {
      type: Number,
      default: 0,
    },
    salah: {
      type: Number,
      default: 0,
    },
    durasiPengerjaan: {
      type: Number, // durasi dalam detik
    },
    log_pelanggaran: [
      {
        jenis_pelanggaran: {
          type: String, // e.g., 'wajah_tidak_ada', 'multi_wajah', 'menoleh', 'pindah_aplikasi'
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        screenshot_url: {
          type: String,
        },
      },
    ],
    berakhir_paksa: {
      type: Boolean,
      default: false,
    },
    jumlah_peringatan: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Result || mongoose.model("Result", resultSchema);
