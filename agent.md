# 🤖 Agent Prompt — Web Admin Clevora
# Tool: Antigravity / Cursor AI / GitHub Copilot
# Fokus: Website Admin saja (tidak menyentuh backend API yang sudah ada)

---

## PROMPT UTAMA (copy semua teks di bawah ini ke Agent):

---

Saya punya project **Clevora** — Platform Pembelajaran Cerdas Berbasis AI.

Backend API Node.js + MongoDB sudah jalan di port **5000**.
Saya ingin membuat **Web Admin terpisah** menggunakan **Node.js + EJS + Bootstrap 5**.

Web admin ini berjalan di port **3000** dan hanya mengkonsumsi API dari backend yang sudah ada.
**JANGAN ubah, tambah, atau sentuh file apapun di folder backend/**.

---

## 📁 STRUKTUR FOLDER YANG HARUS DIBUAT:

```
clevora-admin/                    ← folder terpisah dari backend
├── src/
│   ├── config/
│   │   └── api.config.js         ← base URL ke backend API
│   ├── middleware/
│   │   └── auth.middleware.js    ← cek session admin
│   ├── routes/
│   │   ├── index.js              ← routing utama
│   │   ├── auth.routes.js        ← login/logout admin
│   │   ├── dashboard.routes.js   ← halaman dashboard
│   │   ├── siswa.routes.js       ← CRUD siswa
│   │   ├── guru.routes.js        ← CRUD guru
│   │   ├── nilai.routes.js       ← laporan nilai
│   │   ├── kuis.routes.js        ← monitor kuis
│   │   ├── pelanggaran.routes.js ← log CV proctoring
│   │   └── absensi.routes.js     ← absensi siswa
│   ├── views/
│   │   ├── layouts/
│   │   │   ├── main.ejs          ← layout utama (sidebar + navbar)
│   │   │   └── auth.ejs          ← layout login (tanpa sidebar)
│   │   ├── partials/
│   │   │   ├── sidebar.ejs       ← sidebar navigasi
│   │   │   ├── navbar.ejs        ← top navbar
│   │   │   └── footer.ejs
│   │   ├── auth/
│   │   │   └── login.ejs         ← halaman login admin
│   │   ├── dashboard/
│   │   │   └── index.ejs         ← dashboard utama
│   │   ├── siswa/
│   │   │   ├── index.ejs         ← tabel list siswa
│   │   │   ├── tambah.ejs        ← form tambah siswa
│   │   │   └── edit.ejs          ← form edit siswa
│   │   ├── guru/
│   │   │   ├── index.ejs
│   │   │   ├── tambah.ejs
│   │   │   └── edit.ejs
│   │   ├── nilai/
│   │   │   └── index.ejs         ← laporan nilai + chart
│   │   ├── kuis/
│   │   │   ├── index.ejs         ← list semua kuis
│   │   │   └── detail.ejs        ← detail kuis + siapa submit
│   │   ├── pelanggaran/
│   │   │   └── index.ejs         ← log pelanggaran CV proctoring
│   │   └── absensi/
│   │       └── index.ejs         ← absensi siswa per kelas
│   └── public/
│       ├── css/
│       │   └── admin.css         ← custom CSS (warna Clevora)
│       └── js/
│           └── admin.js          ← custom JS
├── app.js                        ← entry point web admin
├── package.json
└── .env
```

---

## ⚙️ KONFIGURASI

### .env
```env
PORT=3000
SESSION_SECRET=clevora_admin_session_rahasia
API_BASE_URL=http://localhost:5000/api
ADMIN_EMAIL=admin@clevora.id
ADMIN_PASSWORD=Admin@Clevora2026
NODE_ENV=development
```

### package.json dependencies:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "ejs": "^3.1.9",
    "express-ejs-layouts": "^2.5.1",
    "express-session": "^1.17.3",
    "axios": "^1.6.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "connect-flash": "^0.1.1",
    "method-override": "^3.0.0",
    "multer": "^1.4.5-lts.1",
    "exceljs": "^4.3.0",
    "puppeteer": "^21.0.0"
  }
}
```

---

## 🔌 API CONFIG

```javascript
// src/config/api.config.js
const axios = require('axios');

const api = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Attach token admin dari session ke setiap request
api.interceptors.request.use((config) => {
  if (global.adminToken) {
    config.headers.Authorization = `Bearer ${global.adminToken}`;
  }
  return config;
});

module.exports = api;
```

---

## 🔐 AUTH MIDDLEWARE

```javascript
// src/middleware/auth.middleware.js
module.exports.requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.admin) {
    req.flash('error', 'Silakan login terlebih dahulu');
    return res.redirect('/login');
  }
  res.locals.admin = req.session.admin;
  next();
};
```

---

## 🎨 DESIGN SYSTEM (warna Clevora — pakai di CSS):

```css
/* src/public/css/admin.css */
:root {
  --purple:       #534AB7;
  --purple-dark:  #26215C;
  --purple-light: #EEEDFE;
  --teal:         #1D9E75;
  --teal-light:   #E1F5EE;
  --amber:        #EF9F27;
  --amber-light:  #FAEEDA;
  --error:        #E24B4A;
  --error-light:  #FCEBEB;
  --gray-50:      #F9FAFB;
  --gray-200:     #E5E7EB;
  --gray-600:     #4B5563;
  --gray-900:     #111827;
}

/* Sidebar */
.sidebar {
  background: var(--purple-dark);
  min-height: 100vh;
  width: 250px;
}
.sidebar .nav-link { color: rgba(255,255,255,0.7); }
.sidebar .nav-link.active { 
  background: var(--purple);
  color: white;
  border-radius: 8px;
}
.sidebar-brand {
  color: white;
  font-size: 20px;
  font-weight: 700;
}
```

---

## 📄 ISI TIAP HALAMAN:

### 1. Login Admin (auth/login.ejs)
- Background gradient gelap (purple-dark → purple)
- Card login di tengah layar
- Input: Email + Password
- POST ke /login → cek dengan env ADMIN_EMAIL & ADMIN_PASSWORD
- Jika cocok → set req.session.admin → redirect ke /dashboard
- Tampilkan flash message jika gagal

### 2. Layout Utama (layouts/main.ejs)
- Sidebar kiri lebar 250px background purple-dark
- Menu sidebar: Dashboard · Siswa · Guru · Nilai · Kuis · Pelanggaran · Absensi · Logout
- Navbar atas: nama admin + avatar + tombol logout
- Content area kanan menggunakan Bootstrap grid
- Footer sederhana

### 3. Dashboard (dashboard/index.ejs)
**Stat cards baris 1 (4 kartu):**
- Total Siswa Aktif → GET /api/auth/stats atau hitung dari MongoDB
- Total Guru → sama
- Kuis Aktif Hari Ini
- Rata-rata Nilai Keseluruhan

**Chart baris 2:**
- Bar chart kiri: Rata-rata nilai per kelas (Kelas 6A/6B/6C/6D) pakai Chart.js
- Line chart kanan: Tren nilai 7 hari terakhir

**Tabel baris 3:**
- Kuis terbaru yang dibuka (5 data terakhir)
- Siswa dengan nilai terendah (perlu perhatian)

**Data diambil dari:**
```javascript
// GET /api/kuis?status=published → kuis aktif
// GET /api/hasil/rekap → rekap nilai
// GET /api/auth/me dipanggil dengan token admin
```

### 4. Manajemen Siswa (siswa/index.ejs)
- Tabel DataTables dengan kolom: No · Nama · NISN · Kelas · Email · Status · Aksi
- Filter dropdown: Semua Kelas / 6A / 6B / 6C / 6D
- Search bar
- Tombol "Tambah Siswa" → /siswa/tambah
- Aksi per baris: Edit (icon pensil) · Hapus (icon trash, konfirmasi SweetAlert2)
- Pagination

**API yang dipanggil:**
```javascript
GET  /api/auth/siswa-list        ← list semua user role siswa
POST /api/auth/register          ← tambah siswa baru
PUT  /api/auth/update/:id        ← edit siswa
DELETE /api/auth/delete/:id      ← hapus siswa
```

### 5. Form Tambah/Edit Siswa
- Input: Nama Lengkap · Email · NISN · Kelas (dropdown) · Password (hanya saat tambah)
- Validasi client-side dengan Bootstrap validation
- Tombol Simpan + Batal

### 6. Manajemen Guru (guru/index.ejs)
- Sama strukturnya dengan siswa
- Kolom tambahan: Mata Pelajaran · NIP
- Filter by mapel

### 7. Laporan Nilai (nilai/index.ejs)
**Filter bar:**
- Dropdown: Pilih Kelas · Pilih Mata Pelajaran · Pilih Tipe (pretest/postest/ujian) · Periode

**Chart section:**
- Bar chart: Perbandingan rata-rata pretest vs postest per kelas
- Horizontal bar: Distribusi nilai (A/B/C/D/E)

**Tabel nilai:**
- Kolom: Nama Siswa · Kelas · Pretest · Postest · Ujian · Rata-rata · Grade
- Row merah jika rata-rata < 70 (perlu remedial)
- Tombol Export Excel + Export PDF

**API:**
```javascript
GET /api/hasil/kuis/:kuisId    ← rekap nilai per kuis
GET /api/kuis?tipe=pretest     ← filter by tipe
```

### 8. Monitor Kuis (kuis/index.ejs)
- Tabs: Semua · Aktif · Draft · Selesai
- Card per kuis berisi: judul · tipe badge (hijau=pretest, ungu=postest, amber=ujian)
- Progress bar: X dari Y siswa sudah submit
- Badge status dengan warna
- Tombol "Lihat Detail" → /kuis/:id

**Detail Kuis (kuis/detail.ejs):**
- Info kuis di atas (judul, tipe, durasi, total soal)
- Tabel: Nama Siswa · Status (Selesai/Belum) · Nilai · Waktu Submit
- Tombol "Paksa Tutup Kuis" (PUT /api/kuis/:id/publish)

### 9. Log Pelanggaran CV (pelanggaran/index.ejs)
**Ini halaman paling unik — langsung nyambung ke FaceNet proctoring!**

- Filter: By Kelas · By Tanggal · By Jenis Pelanggaran
- Tabel dengan kolom:
  - Nama Siswa
  - Kelas
  - Nama Kuis (Ujian)
  - Jenis Pelanggaran (badge warna merah: wajah_tidak_ada / multi_wajah / menoleh / pindah_aplikasi)
  - Timestamp
  - Berakhir Paksa (Ya/Tidak badge)
  - Aksi: Lihat Detail

**Detail pelanggaran per siswa:**
- Timeline pelanggaran dengan icon dan timestamp
- Screenshot wajah jika ada (tampilkan dalam modal)
- Tombol export PDF log pelanggaran

**API:**
```javascript
GET /api/hasil?filter=pelanggaran  ← ambil hasil ujian dengan log_pelanggaran
// Filter: berakhir_paksa=true, jumlah_peringatan>0
```

### 10. Absensi (absensi/index.ejs)
- Filter: Kelas · Bulan · Tahun
- Tabel: Nama Siswa + kolom tanggal (H=Hadir, S=Sakit, I=Izin, A=Alpa)
- Warna cell: Hadir=hijau, Sakit=biru, Izin=kuning, Alpa=merah
- Summary baris bawah: total hadir/sakit/izin/alpa per siswa
- Chart donut: Persentase kehadiran kelas bulan ini
- Tombol Export PDF Rekap Absensi

**Catatan:** Jika belum ada model Absensi di backend, buat endpoint baru:
```javascript
// Tambah di backend yang ada (bukan buat ulang):
GET  /api/absensi?kelas=6A&bulan=5&tahun=2026
POST /api/absensi              ← catat absensi hari ini
```

---

## 🚀 APP.JS (entry point):

```javascript
// app.js
require('dotenv').config();
const express        = require('express');
const session        = require('express-session');
const flash          = require('connect-flash');
const morgan         = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const path           = require('path');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'src/public')));

// Session & Flash
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 hari
}));
app.use(flash());

// Global variables untuk views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error   = req.flash('error');
  res.locals.admin   = req.session.admin || null;
  next();
});

// Routes
app.use('/',              require('./src/routes/auth.routes'));
app.use('/dashboard',     require('./src/routes/dashboard.routes'));
app.use('/siswa',         require('./src/routes/siswa.routes'));
app.use('/guru',          require('./src/routes/guru.routes'));
app.use('/nilai',         require('./src/routes/nilai.routes'));
app.use('/kuis',          require('./src/routes/kuis.routes'));
app.use('/pelanggaran',   require('./src/routes/pelanggaran.routes'));
app.use('/absensi',       require('./src/routes/absensi.routes'));

// 404
app.use((req, res) => {
  res.status(404).render('404', { layout: false, title: '404 - Halaman tidak ditemukan' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Clevora Admin running at http://localhost:${PORT}`);
});
```

---

## ✅ ATURAN PENTING UNTUK AGENT:

1. **JANGAN sentuh folder backend/** — web admin adalah project terpisah
2. Semua data diambil lewat **axios HTTP request ke localhost:5000/api**
3. Gunakan **Bootstrap 5** untuk semua komponen UI
4. Gunakan **Chart.js** untuk semua grafik (bar chart, line chart, donut chart)
5. Gunakan **DataTables.js** untuk semua tabel (sorting, filtering, pagination)
6. Gunakan **SweetAlert2** untuk semua konfirmasi hapus/aksi destruktif
7. Flash message untuk semua notifikasi sukses/error
8. Semua halaman pakai layout `main.ejs` kecuali login pakai layout `auth.ejs`
9. Warna mengikuti design system Clevora (purple #534AB7, teal #1D9E75, amber #EF9F27)
10. Responsive — gunakan Bootstrap grid sehingga bisa dibuka di tablet/laptop

---

## 🔢 URUTAN PENGERJAAN:

Buat file-file berikut secara berurutan:
1. package.json + .env
2. app.js
3. src/config/api.config.js
4. src/middleware/auth.middleware.js
5. src/views/layouts/main.ejs + auth.ejs
6. src/views/partials/sidebar.ejs + navbar.ejs + footer.ejs
7. src/public/css/admin.css
8. src/routes/auth.routes.js + src/views/auth/login.ejs
9. src/routes/dashboard.routes.js + src/views/dashboard/index.ejs
10. src/routes/siswa.routes.js + views (index, tambah, edit)
11. src/routes/guru.routes.js + views
12. src/routes/nilai.routes.js + views (dengan Chart.js)
13. src/routes/kuis.routes.js + views (index, detail)
14. src/routes/pelanggaran.routes.js + views
15. src/routes/absensi.routes.js + views

---

Buatkan semua file sesuai struktur dan spesifikasi di atas.
Mulai dari nomor 1 sampai 15 secara berurutan.
Pastikan setiap file lengkap dan bisa langsung dijalankan.