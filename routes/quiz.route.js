import express from "express";
import {
  createQuiz,
  getCourseQuizzes,
  updateQuizAttemptScore,
} from "../controllers/quiz.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js"

const router = express.Router();

// POST - create quiz
router.post("/", protectRoute, adminRoute, createQuiz);
// GET - all quizzes for a course
router.get("/:courseCode", protectRoute, getCourseQuizzes);
// PUT - create quiz attempt
router.post("/attempt-score", protectRoute, updateQuizAttemptScore);

export default router;