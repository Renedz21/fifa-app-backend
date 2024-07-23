import { Router } from "express";
import { createMatchResult } from "../controllers/result.controller";

const router = Router();

router.post("/create", createMatchResult);

export default router;
