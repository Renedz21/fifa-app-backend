import { Router } from "express";
import {
  createMatchResult,
  getMatchResults,
} from "../controllers/result.controller";

const router = Router();

router.post("/create", createMatchResult);
router.get("/", getMatchResults);

export default router;
