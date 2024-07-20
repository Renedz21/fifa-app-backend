import { Router } from "express";
import {
  createPlayer,
  deletePlayer,
  getAllPlayers,
  getOnePlayer,
  updatePlayer,
} from "../controllers/player.controller";

const router = Router();

router.post("/", createPlayer);
router.get("/", getAllPlayers);
router.get("/:userId", getOnePlayer);
router.patch("/:userId", updatePlayer);
router.delete("/:userId", deletePlayer);

export default router;
