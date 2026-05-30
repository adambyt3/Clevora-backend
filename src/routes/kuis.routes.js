const express = require("express");
const {
  createQuiz,
  getQuizzes,
  getQuizById,
  addQuestion,
  submitQuiz,
} = require("../controllers/quizController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("guru"), createQuiz);
router.get("/", authMiddleware, getQuizzes);
router.get("/:id", authMiddleware, getQuizById);
router.post("/:id/soal", authMiddleware, roleMiddleware("guru"), addQuestion);
router.post("/:id/submit", authMiddleware, roleMiddleware("siswa"), submitQuiz);

module.exports = router;
