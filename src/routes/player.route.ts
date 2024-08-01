import { Router } from "express";
import {
  createPlayer,
  deletePlayer,
  getActualUser,
  getAllPlayers,
  getOnePlayer,
  updatePlayer,
} from "../controllers/player.controller";

const router = Router();

router.post("/", createPlayer);
router.get("/", getAllPlayers);

router.get("/me", getActualUser);
router.get("/:userId", getOnePlayer);
router.patch("/:userId", updatePlayer);
router.delete("/:userId", deletePlayer);

export default router;
