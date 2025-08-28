import express from "express";
import {
  createQuiz,
  getCourseQuizzes,
  updateQuizAttemptScore,
} from "../controllers/quiz.controller.js";

const router = express.Router();

// POST - create quiz
router.post("/", createQuiz);
// GET - all quizzes for a course
router.get("/:courseCode", getCourseQuizzes);
// PUT - create quiz attempt
router.post("/attempt-score", updateQuizAttemptScore);

export default router;