import { Router } from "express";
import {
  createTeam,
  getTeams,
  getTeamsDb,
  updateTeam,
} from "../controllers/team.controller";

const router = Router();

router.post("/", createTeam);
router.get("/", getTeamsDb);
router.get("/getjson", getTeams);
router.put("/:teamId", updateTeam);

export default router;
