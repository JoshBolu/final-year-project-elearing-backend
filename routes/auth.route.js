import express from "express";
import { signUp, login, logout, refreshToken, getProfile, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.patch("/updateProfile", protectRoute, updateProfile)
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);

// router.get("/profile", protectRoute, getProfile);

export default router;