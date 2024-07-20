import { Router } from "express";
import { createMatch, getMatches } from "../controllers/match.controller";

const router = Router();

router.post("/", createMatch);
router.get("/", getMatches);

export default router;
