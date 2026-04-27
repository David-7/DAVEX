import express from "express";
import { register, login, logout, getMe, checkResetIdentity, resetPassword } from "../controllers/authController.ts";
import { protect } from "../middleware/auth.ts";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/reset-identity", checkResetIdentity);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);

export default router;
