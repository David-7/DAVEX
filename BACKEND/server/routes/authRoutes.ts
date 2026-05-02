import express from "express";
import { register, login, logout, getMe, checkResetIdentity, resetPassword } from "../controllers/authController.ts";
import { protect } from "../middleware/auth.ts";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get('/csrf-token', (req, res) => {
	try {
		const token = (req as any).csrfToken ? (req as any).csrfToken() : null;
		res.json({ csrfToken: token });
	} catch (err) {
		res.status(500).json({ message: 'CSRF token unavailable' });
	}
});
router.post("/reset-check", checkResetIdentity);
router.post("/reset", resetPassword);
// Compatibility routes used by frontend
router.post("/reset-identity", checkResetIdentity);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
