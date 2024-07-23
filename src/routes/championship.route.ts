import { Router } from "express";
import {
  createChampionship,
  getAllChampionships,
  getOneChampionship,
  updateTeamsInChampionship,
} from "../controllers/championship.controller";

const router = Router();

router.post("/", createChampionship);
router.get("/", getAllChampionships);
router.get("/:championshipId", getOneChampionship);
router.put("/:championshipId/teams", updateTeamsInChampionship);

export default router;
