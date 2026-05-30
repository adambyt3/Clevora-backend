const Absensi = require("../models/Absensi");
const User = require("../models/User");

// 1. Get attendance records by class, month, and year
exports.getAttendance = async (req, res) => {
  try {
    const { kelas, bulan, tahun } = req.query;

    if (!kelas) {
      return res.status(400).json({
        success: false,
        message: "Kelas wajib dispesifikasikan",
      });
    }

    // Default to current month/year if not specified
    const now = new Date();
    const queryMonth = bulan ? parseInt(bulan) - 1 : now.getMonth(); // 0-indexed in JS Date
    const queryYear = tahun ? parseInt(tahun) : now.getFullYear();

    // Get all students in the class
    const siswaList = await User.find({ role: "siswa", kelas }).sort({ nama: 1 });

    // Define start and end date for filtering
    const startDate = new Date(queryYear, queryMonth, 1);
    const endDate = new Date(queryYear, queryMonth + 1, 0, 23, 59, 59, 999);

    // Fetch all attendance logs for this class and date range
    const attendanceLogs = await Absensi.find({
      kelas,
      tanggal: { $gte: startDate, $lte: endDate },
    }).populate("siswa", "nama email");

    res.status(200).json({
      success: true,
      message: "Data absensi berhasil didapatkan",
      data: {
        siswa: siswaList,
        logs: attendanceLogs,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Record/update attendance for today or specific date
exports.recordAttendance = async (req, res) => {
  try {
    const { records, tanggal, kelas } = req.body; // records: [{ siswaId, status: 'H'|'S'|'I'|'A' }]

    if (!records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: "Data absensi (records) wajib berformat Array",
      });
    }

    if (!kelas) {
      return res.status(400).json({
        success: false,
        message: "Kelas wajib ditentukan",
      });
    }

    // Parse date, standardise to start of day in UTC or local timezone
    const recordDate = tanggal ? new Date(tanggal) : new Date();
    recordDate.setHours(0, 0, 0, 0);

    const savedRecords = [];

    for (const record of records) {
      const { siswaId, status } = record;

      if (!siswaId || !["H", "S", "I", "A"].includes(status)) {
        continue;
      }

      // Upsert record
      const attendance = await Absensi.findOneAndUpdate(
        { siswa: siswaId, tanggal: recordDate },
        { siswa: siswaId, kelas, tanggal: recordDate, status },
        { upsert: true, new: true }
      );
      savedRecords.push(attendance);
    }

    res.status(200).json({
      success: true,
      message: "Data absensi berhasil dicatat/diperbarui",
      data: savedRecords,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
