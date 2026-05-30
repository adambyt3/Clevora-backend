const express = require("express");
const {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
} = require("../controllers/moduleController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("guru"), createModule);
router.get("/", authMiddleware, getModules);
router.get("/:id", authMiddleware, getModuleById);
router.put("/:id", authMiddleware, roleMiddleware("guru"), updateModule);
router.delete("/:id", authMiddleware, roleMiddleware("guru"), deleteModule);

module.exports = router;
