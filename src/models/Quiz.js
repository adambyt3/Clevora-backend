const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    judul: {
      type: String,
      required: true,
    },
    deskripsi: {
      type: String,
    },
    guru: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mapel: {
      type: String,
    },
    kelas: {
      type: String,
    },
    durasi: {
      type: Number,
      default: 30, // durasi dalam menit
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
