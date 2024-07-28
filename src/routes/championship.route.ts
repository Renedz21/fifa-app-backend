import { Router } from "express";
import {
  createChampionship,
  getAllChampionships,
  getOneChampionship,
  updateTeamsInChampionship,
  addMatchInChampionship,
  deleteChampionship,
  getChampionshipStats,
  updateChampionship,
} from "../controllers/championship.controller";

const router = Router();

router.post("/", createChampionship);
router.get("/", getAllChampionships);
router.get("/:championshipId", getOneChampionship);
router.get("/:championshipId/stats", getChampionshipStats);
router.put("/:championshipId", updateChampionship);
router.put("/:championshipId/teams", updateTeamsInChampionship);
router.put("/:championshipId/match", addMatchInChampionship);
router.delete("/:championshipId", deleteChampionship);

export default router;
