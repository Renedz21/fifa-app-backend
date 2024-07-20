import { Router } from "express";
import { getTeams } from "./team.controller";

const router = Router();

router.get("/", getTeams);

export default router;
