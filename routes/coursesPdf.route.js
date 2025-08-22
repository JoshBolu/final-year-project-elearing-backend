import express from "express";
import { adminRoute } from "../middleware/auth.middleware.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

import {
  getPdfCourses,
  deletePdfCourse,
  createPdfCourse,
} from "../controllers/pdfCourses.controller.js";

router.get("/getPdfCourses", protectRoute, getPdfCourses);
router.post("/addPdfCourse", protectRoute, adminRoute, upload.single("filePath"), createPdfCourse);
router.delete("/deletePdfCourse/:id", protectRoute, adminRoute, deletePdfCourse);

export default router;