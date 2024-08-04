import { Router } from "express";
import {
  createEnterprise,
  getEnterprises,
} from "../controllers/enterprise.controller";

const router = Router();

router.post("/", createEnterprise);
router.get("/", getEnterprises);

export default router;
