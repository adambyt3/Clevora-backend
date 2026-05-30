const Module = require("../models/Module");

exports.generateDevice = async (req, res) => {
  try {
    const { type, topic, kelas, mapel, additionalPrompt } = req.body;

    if (!type || !topic || !kelas || !mapel) {
      return res.status(400).json({
        success: false,
        message: "Parameter type, topic, kelas, dan mapel wajib diisi",
      });
    }

    const validTypes = ["ATP", "Modul", "Materi", "Quiz"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Tipe generate tidak valid. Harus salah satu dari: ATP, Modul, Materi, Quiz",
      });
    }

    let systemPrompt = "";
    if (type === "ATP") {
      systemPrompt = `Buatlah Alur Tujuan Pembelajaran (ATP) lengkap untuk mata pelajaran ${mapel} kelas ${kelas} dengan topik "${topic}". ATP harus berstruktur logis, memuat Capaian Pembelajaran, Tujuan Pembelajaran, Alokasi Waktu, dan Materi Pokok. ${additionalPrompt ? `Catatan tambahan: ${additionalPrompt}` : ""}. Gunakan bahasa Indonesia yang baik dan benar. Format output harus menggunakan Markdown yang sangat rapi dan estetik.`;
    } else if (type === "Modul") {
      systemPrompt = `Buatlah Modul Ajar Kurikulum Merdeka lengkap untuk mata pelajaran ${mapel} kelas ${kelas} dengan topik "${topic}". Modul harus memuat:
1. Informasi Umum (Identitas, Kompetensi Awal, Profil Pelajar Pancasila, Sarana Prasarana).
2. Komponen Inti (Tujuan Pembelajaran, Pemahaman Bermakna, Pertanyaan Pemantik, Kegiatan Pembelajaran Pembuka-Inti-Penutup, Asesmen).
3. Lampiran (Lembar Kerja Peserta Didik/LKPD, Pengayaan & Remedial, Glosarium).
${additionalPrompt ? `Catatan tambahan dari guru: ${additionalPrompt}` : ""}.
Gunakan bahasa Indonesia yang baik dan benar. Format output harus menggunakan Markdown yang sangat rapi dan terstruktur.`;
    } else if (type === "Materi") {
      systemPrompt = `Buatlah Bahan Ajar / Materi Pembelajaran terperinci untuk mata pelajaran ${mapel} kelas ${kelas} dengan topik "${topic}". Materi harus mudah dipahami, memuat pendahuluan, penjelasan konsep-konsep kunci dengan contoh konkret, rangkuman, dan daftar referensi singkat. ${additionalPrompt ? `Catatan tambahan dari guru: ${additionalPrompt}` : ""}. Gunakan bahasa Indonesia yang baik dan benar. Format output harus menggunakan Markdown yang sangat rapi, menarik, dan informatif.`;
    } else if (type === "Quiz") {
      systemPrompt = `Buatlah Kuis Pembelajaran terstruktur untuk mata pelajaran ${mapel} kelas ${kelas} dengan topik "${topic}". Buatlah 5 soal pilihan ganda (A, B, C, D) yang bervariasi dari tingkat kognitif rendah hingga tinggi (HOTS). Tuliskan Kunci Jawaban dan pembahasan singkat di bagian akhir kuis. ${additionalPrompt ? `Catatan tambahan dari guru: ${additionalPrompt}` : ""}. Gunakan bahasa Indonesia yang baik dan benar. Format output harus menggunakan Markdown yang sangat rapi.`;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log("[AI] GEMINI_API_KEY not found in env. Falling back to high-quality mock response.");
      return res.status(200).json({
        success: true,
        message: "Generate berhasil (Fallback Mock)",
        data: {
          result: getMockResponse(type, topic, kelas, mapel),
        },
      });
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: systemPrompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error?.message || "Gagal memanggil Gemini API");
      }

      const generatedText = responseData.candidates[0].content.parts[0].text;

      res.status(200).json({
        success: true,
        message: `Generate ${type} berhasil menggunakan Gemini AI`,
        data: {
          result: generatedText,
        },
      });
    } catch (apiError) {
      console.error("[AI API Error]:", apiError.message);
      console.log("[AI] API call failed. Falling back to mock response.");
      res.status(200).json({
        success: true,
        message: "Generate berhasil (Fallback Mock)",
        data: {
          result: getMockResponse(type, topic, kelas, mapel),
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

function getMockResponse(type, topic, kelas, mapel) {
  if (type === "ATP") {
    return `# Alur Tujuan Pembelajaran (ATP)
**Mata Pelajaran:** ${mapel}
**Kelas:** ${kelas}
**Topik Utama:** ${topic}

---

## 1. Capaian Pembelajaran (CP)
Pada akhir fase ini, peserta didik mampu memahami, menganalisis, dan mengimplementasikan konsep dasar tentang **${topic}** secara kritis, mandiri, dan kreatif sesuai dengan Profil Pelajar Pancasila.

## 2. Alur Tujuan Pembelajaran
| No | Tujuan Pembelajaran (TP) | Kriteria Ketercapaian (KKTP) | Alokasi Waktu |
|---|---|---|---|
| 1 | Mengidentifikasi konsep dasar **${topic}** | Peserta didik mampu menjelaskan pengertian dan sejarah singkat **${topic}**. | 2 JP |
| 2 | Menganalisis elemen pendukung dalam **${topic}** | Peserta didik mampu menyebutkan dan menguraikan fungsi 3 komponen utama. | 4 JP |
| 3 | Mempraktikkan penerapan **${topic}** | Peserta didik mampu mendemonstrasikan studi kasus sederhana secara berkelompok. | 4 JP |

---
*Dibuat otomatis oleh Asisten AI Clevora.*`;
  } else if (type === "Modul") {
    return `# Modul Ajar (RPP) Kurikulum Merdeka
**Mata Pelajaran:** ${mapel}
**Kelas:** ${kelas}
**Topik:** ${topic}

---

## I. Informasi Umum
* **Penyusun:** Guru Informatika Clevora
* **Kompetensi Awal:** Peserta didik memiliki pemahaman dasar tentang teknologi komputer.
* **Profil Pelajar Pancasila:** Mandiri, Bernalar Kritis, Kreatif.
* **Sarana & Prasarana:** Laptop, Proyektor, Internet, Buku Paket.

## II. Komponen Inti
### A. Tujuan Pembelajaran
* Peserta didik mampu memahami dan menjelaskan esensi dasar dari **${topic}**.
* Peserta didik mampu menganalisis studi kasus riil mengenai **${topic}**.

### B. Kegiatan Pembelajaran
1. **Kegiatan Pendahuluan (15 Menit):**
   * Guru membuka kelas dengan salam dan doa.
   * Apersepsi: Menampilkan video relevan tentang **${topic}**.
2. **Kegiatan Inti (60 Menit):**
   * Guru menjelaskan konsep dasar **${topic}**.
   * Siswa dibagi menjadi kelompok diskusi untuk menganalisis studi kasus.
   * Presentasi hasil kelompok.
3. **Kegiatan Penutup (15 Menit):**
   * Guru memfasilitasi refleksi bersama.
   * Penugasan mandiri & doa penutup.

---
*Dibuat otomatis oleh Asisten AI Clevora.*`;
  } else if (type === "Materi") {
    return `# Bahan Ajar: Memahami ${topic}
**Mata Pelajaran:** ${mapel}
**Kelas:** ${kelas}

---

## Pendahuluan
Materi ini disusun untuk mempermudah pemahaman peserta didik mengenai **${topic}** pada jenjang kelas ${kelas}. Pembahasan akan dibagi menjadi konsep dasar, pengaplikasian praktis, dan rangkuman.

## 1. Konsep Utama
**${topic}** secara terminologi adalah bidang bahasan yang mempelajari bagaimana sistem atau konsep dasar beroperasi dalam ekosistem teknologi modern. Terdapat tiga pilar penting:
1. **Akurasi:** Memastikan kebenaran data input dan pemrosesan.
2. **Kecepatan:** Efisiensi dalam pemrosesan tugas.
3. **Reaktivitas:** Respon real-time terhadap aksi pengguna.

## 2. Studi Kasus Penerapan
Dalam kehidupan sehari-hari, kita sering menjumpai pengaplikasian **${topic}** pada sistem otomasi sekolah, aplikasi mobile pendidikan, dan sistem manajemen pembelajaran digital.

## Rangkuman
Memahami **${topic}** membantu kita beradaptasi dengan kemajuan digital dan melatih logika berpikir komputasional secara terstruktur.

---
*Dibuat otomatis oleh Asisten AI Clevora.*`;
  } else {
    return `# Kuis Pembelajaran: ${topic}
**Mata Pelajaran:** ${mapel}
**Kelas:** ${kelas}

---

### Soal Pilihan Ganda

**Soal 1:** Apa fungsi utama dari konsep dasar **${topic}**?
* A. Mempercepat koneksi internet.
* B. Menjadi fondasi dasar pemecahan masalah yang logis dan efisien.
* C. Mengubah desain tampilan aplikasi.
* D. Mengurangi konsumsi daya komputer.

**Soal 2:** Manakah di bawah ini yang merupakan komponen penting dalam **${topic}**?
* A. Struktur data dan algoritma masukan.
* B. Kabel jaringan LAN.
* C. Resolusi monitor komputer.
* D. Sistem pendingin CPU.

---

### Kunci Jawaban
1. **B** (Karena konsep dasar bertujuan melatih logika dan efisiensi pemecahan masalah).
2. **A** (Struktur data dan algoritma adalah komponen fundamentalnya).

---
*Dibuat otomatis oleh Asisten AI Clevora.*`;
  }
}
