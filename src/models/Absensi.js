const mongoose = require("mongoose");

const absensiSchema = new mongoose.Schema(
  {
    siswa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    kelas: {
      type: String,
      required: true,
    },
    tanggal: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["H", "S", "I", "A"],
      default: "H",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one record per student per day
absensiSchema.index({ siswa: 1, tanggal: 1 }, { unique: true });

module.exports = mongoose.models.Absensi || mongoose.model("Absensi", absensiSchema);
