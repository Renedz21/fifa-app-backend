import { Router } from "express";
import {
  createChampionship,
  getAllChampionships,
  updateTeamsInChampionship,
} from "../controllers/championship.controller";

const router = Router();

router.post("/", createChampionship);
router.get("/", getAllChampionships);
router.put("/:championshipId/teams", updateTeamsInChampionship);

export default router;
