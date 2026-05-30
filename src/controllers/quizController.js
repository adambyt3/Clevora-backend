const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Result = require("../models/Result");

// 1. Create a new Quiz (Guru)
exports.createQuiz = async (req, res) => {
  try {
    const { judul, deskripsi, mapel, kelas, durasi } = req.body;

    if (!judul) {
      return res.status(400).json({
        success: false,
        message: "Judul kuis wajib diisi",
      });
    }

    const newQuiz = await Quiz.create({
      judul,
      deskripsi,
      guru: req.user._id,
      mapel: mapel || req.user.mapel,
      kelas: kelas || req.user.kelas,
      durasi: durasi || 30,
    });

    res.status(201).json({
      success: true,
      message: "Kuis berhasil dibuat",
      data: newQuiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Get all quizzes (Guru sees own, Siswa sees relevant)
exports.getQuizzes = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "guru") {
      query.guru = req.user._id;
    } else if (req.user.role === "siswa") {
      if (req.user.kelas) {
        query.$or = [{ kelas: req.user.kelas }, { kelas: { $exists: false } }, { kelas: "" }];
      }
    }

    const quizzes = await Quiz.find(query)
      .populate("guru", "nama email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Daftar kuis berhasil dimuat",
      data: quizzes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Get Quiz by ID (includes Questions)
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("guru", "nama email");
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Kuis tidak ditemukan",
      });
    }

    const questions = await Question.find({ kuis: quiz._id });

    res.status(200).json({
      success: true,
      message: "Detail kuis berhasil dimuat",
      data: {
        ...quiz.toObject(),
        soal: questions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Add a Question to Quiz (Guru only)
exports.addQuestion = async (req, res) => {
  try {
    const { pertanyaan, pilihan, kunciJawaban, penjelasan } = req.body;
    const quizId = req.params.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Kuis tidak ditemukan",
      });
    }

    // Ownership check
    if (quiz.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Anda bukan pembuat kuis ini.",
      });
    }

    if (!pertanyaan || !pilihan || kunciJawaban === undefined) {
      return res.status(400).json({
        success: false,
        message: "Pertanyaan, pilihan jawaban, dan kunci jawaban wajib diisi",
      });
    }

    const newQuestion = await Question.create({
      kuis: quizId,
      pertanyaan,
      pilihan,
      kunciJawaban,
      penjelasan,
    });

    res.status(201).json({
      success: true,
      message: "Soal berhasil ditambahkan ke kuis",
      data: newQuestion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 5. Submit Quiz / Grading (Siswa only)
exports.submitQuiz = async (req, res) => {
  try {
    const { jawaban, durasiPengerjaan } = req.body; // jawaban: [{ soalId, jawabanSiswa }]
    const quizId = req.params.id;

    if (!jawaban || !Array.isArray(jawaban)) {
      return res.status(400).json({
        success: false,
        message: "Jawaban wajib dikirimkan dalam format array",
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Kuis tidak ditemukan",
      });
    }

    const questions = await Question.find({ kuis: quizId });
    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Kuis ini tidak memiliki soal ujian",
      });
    }

    let benar = 0;
    let salah = 0;
    const gradedJawaban = [];

    for (let q of questions) {
      const studentAnsObj = jawaban.find((ans) => ans.soalId === q._id.toString());
      const selectedAns = studentAnsObj ? studentAnsObj.jawabanSiswa : -1;
      const isCorrect = selectedAns === q.kunciJawaban;

      if (isCorrect) {
        benar++;
      } else {
        salah++;
      }

      gradedJawaban.push({
        soal: q._id,
        jawabanSiswa: selectedAns,
        isCorrect: isCorrect,
      });
    }

    const nilai = Math.round((benar / questions.length) * 100);

    const result = await Result.create({
      siswa: req.user._id,
      kuis: quizId,
      jawaban: gradedJawaban,
      nilai,
      benar,
      salah,
      durasiPengerjaan: durasiPengerjaan || 0,
    });

    res.status(200).json({
      success: true,
      message: "Ujian berhasil dikumpulkan dan dinilai otomatis",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
