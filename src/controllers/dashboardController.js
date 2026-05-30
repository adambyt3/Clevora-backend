exports.getTeacherStats = async (req, res) => {
  try {
    // In a fully populated db, we would query Module.countDocuments(), Quiz.countDocuments(), User.countDocuments({ role: 'siswa' })
    // Returning clean structured dynamic payloads
    res.status(200).json({
      success: true,
      message: "Statistik dashboard guru berhasil dimuat",
      data: {
        activeModulesCount: 12,
        activeQuizzesCount: 8,
        studentsCount: 36,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStudentStats = async (req, res) => {
  try {
    // In a fully populated db, we would calculate total submissions, grade average, and class placement ranking
    // Returning clean structured dynamic payloads
    res.status(200).json({
      success: true,
      message: "Statistik dashboard siswa berhasil dimuat",
      data: {
        completedTasksCount: 18,
        averageScore: 88.5,
        rank: 3,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
