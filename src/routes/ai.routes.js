const express = require("express");
const { generateDevice } = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/generate", authMiddleware, roleMiddleware("guru"), generateDevice);

module.exports = router;
