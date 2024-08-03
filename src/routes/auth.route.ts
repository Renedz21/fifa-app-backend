import { Router } from "express";
import {
  authenticateGoogle,
  authenticateGoogleCallback,
  login,
  register,
} from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/register", register);

router.get("/google", authenticateGoogle);
router.get("/google/callback", authenticateGoogleCallback);

export default router;
