const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    judul: {
      type: String,
      required: true,
    },
    deskripsi: {
      type: String,
    },
    konten: {
      type: String,
      required: true,
    },
    guru: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mapel: {
      type: String,
    },
    jenjang: {
      type: String,
    },
    kelas: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Module || mongoose.model("Module", moduleSchema);
