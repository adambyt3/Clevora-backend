const Module = require("../models/Module");

exports.createModule = async (req, res) => {
  try {
    const { judul, deskripsi, konten, mapel, jenjang, kelas } = req.body;

    if (!judul || !konten) {
      return res.status(400).json({
        success: false,
        message: "Judul dan konten modul wajib diisi",
      });
    }

    const newModule = await Module.create({
      judul,
      deskripsi,
      konten,
      guru: req.user._id,
      mapel: mapel || req.user.mapel,
      jenjang: jenjang || req.user.jenjang,
      kelas: kelas || req.user.kelas,
    });

    res.status(201).json({
      success: true,
      message: "Modul belajar berhasil dibuat",
      data: newModule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getModules = async (req, res) => {
  try {
    let query = {};
    
    // Role-specific filtering
    if (req.user.role === "guru") {
      query.guru = req.user._id;
    } else if (req.user.role === "siswa") {
      if (req.user.kelas) {
        query.$or = [{ kelas: req.user.kelas }, { kelas: { $exists: false } }, { kelas: "" }];
      }
    }

    const modules = await Module.find(query)
      .populate("guru", "nama email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Daftar modul belajar berhasil dimuat",
      data: modules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate("guru", "nama email");

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Modul belajar tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Detail modul belajar berhasil dimuat",
      data: module,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const { judul, deskripsi, konten, mapel, jenjang, kelas } = req.body;
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Modul belajar tidak ditemukan",
      });
    }

    // Ownership check
    if (module.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Anda bukan pembuat modul ini.",
      });
    }

    module.judul = judul || module.judul;
    module.deskripsi = deskripsi || module.deskripsi;
    module.konten = konten || module.konten;
    module.mapel = mapel || module.mapel;
    module.jenjang = jenjang || module.jenjang;
    module.kelas = kelas || module.kelas;

    await module.save();

    res.status(200).json({
      success: true,
      message: "Modul belajar berhasil diperbarui",
      data: module,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Modul belajar tidak ditemukan",
      });
    }

    // Ownership check
    if (module.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Anda bukan pembuat modul ini.",
      });
    }

    await module.deleteOne();

    res.status(200).json({
      success: true,
      message: "Modul belajar berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
