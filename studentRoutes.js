const express = require("express");
const router = express.Router();
const {
  addStudent, getAllStudents, getStudentById, updateStudent, deleteStudent
} = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, getAllStudents);
router.get("/:id", authMiddleware, getStudentById);
router.post("/", authMiddleware, roleMiddleware("admin"), addStudent);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateStudent);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteStudent);

module.exports = router;