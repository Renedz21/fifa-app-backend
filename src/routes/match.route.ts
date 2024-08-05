import { Router } from "express";
import {
  createMatch,
  getMatches,
  updateMatchResult,
} from "../controllers/match.controller";

const router = Router();

router.post("/", createMatch);
router.get("/", getMatches);
router.put("/:matchId", updateMatchResult);

export default router;
