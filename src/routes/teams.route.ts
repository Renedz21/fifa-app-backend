import { Router } from "express";
import {
  createTeam,
  getTeams,
  getTeamsDb,
} from "../controllers/team.controller";

const router = Router();

router.post("/", createTeam);
router.get("/", getTeamsDb);
router.get("/getjson", getTeams);

export default router;
