import express from "express";
import { adminRoute } from "../middleware/auth.middleware.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

import {
  getAllPastQuestions,
  createPastQuestion,
  getPastQuestionsPerCourse,
  deletePastQuestion,
} from "../controllers/pastQuestionCourses.controller.js";

router.get("/getAllPastQuestions", protectRoute, adminRoute, getAllPastQuestions);
router.get("/getPastQuestionsPerCourse/:courseCode", protectRoute, getPastQuestionsPerCourse);
router.post("/createPastQuestion", protectRoute, adminRoute, createPastQuestion);
router.delete("/deletePastQuestion/:id", protectRoute, adminRoute, deletePastQuestion);

export default router;