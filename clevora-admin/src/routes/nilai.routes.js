const express = require("express");
const api = require("../config/api.config");
const { requireAdmin } = require("../middleware/auth.middleware");
const ExcelJS = require("exceljs");

const router = express.Router();

// GET /nilai (List, filters, and charts)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const response = await api.get("/hasil/rekap");
    const results = response.data.data;

    res.render("nilai/index", {
      title: "Laporan Nilai - Clevora Admin",
      path: "/nilai",
      results
    });
  } catch (error) {
    console.error("Grades rekap error:", error.message);
    res.render("nilai/index", {
      title: "Laporan Nilai - Clevora Admin",
      path: "/nilai",
      results: [],
      error: "Gagal mengambil data rekap nilai dari server."
    });
  }
});

// GET /nilai/export-excel
router.get("/export-excel", requireAdmin, async (req, res) => {
  try {
    const response = await api.get("/hasil/rekap");
    const results = response.data.data;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Rekap Nilai Clevora");

    // Define Columns
    worksheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "Nama Siswa", key: "nama", width: 25 },
      { header: "Kelas", key: "kelas", width: 10 },
      { header: "Mata Pelajaran", key: "mapel", width: 20 },
      { header: "Kuis / Ujian", key: "kuis", width: 25 },
      { header: "Nilai Skor", key: "nilai", width: 12 },
      { header: "Kebenaran (Benar/Salah)", key: "stats", width: 20 },
      { header: "Tanggal Ujian", key: "tanggal", width: 20 },
    ];

    // Style Headers
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF534AB7" }, // Clevora Purple
    };

    results.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        nama: item.siswa ? item.siswa.nama : "N/A",
        kelas: item.siswa ? item.siswa.kelas : "N/A",
        mapel: item.kuis ? item.kuis.mapel : "N/A",
        kuis: item.kuis ? item.kuis.judul : "N/A",
        nilai: item.nilai,
        stats: `${item.benar} B / ${item.salah} S`,
        tanggal: new Date(item.createdAt).toLocaleDateString("id-ID"),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + `Rekap_Nilai_Clevora_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel export error:", error.message);
    req.flash("error", "Gagal mengunduh file Excel rekap nilai.");
    res.redirect("/nilai");
  }
});

module.exports = router;
