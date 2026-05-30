const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    kuis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    pertanyaan: {
      type: String,
      required: true,
    },
    pilihan: {
      type: [String],
      required: true,
      validate: [
        (val) => val.length >= 2,
        "Pilihan jawaban minimal harus ada 2 opsi",
      ],
    },
    kunciJawaban: {
      type: Number, // 0-indexed index (0 untuk A, 1 untuk B, dll)
      required: true,
    },
    penjelasan: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Question || mongoose.model("Question", questionSchema);
