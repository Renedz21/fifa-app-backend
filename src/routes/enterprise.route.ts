import { Router } from "express";
import {
  createEnterprise,
  deleteEnterprise,
  getEnterprises,
  updateEnterprise,
} from "../controllers/enterprise.controller";
import { authorize } from "../middleware/auth.middleware";
import { Role } from "../constants/constants";

const router = Router();

router.post("/", authorize([Role.ADMIN]), createEnterprise);
router.get("/", authorize([Role.ADMIN]), getEnterprises);
router.put("/:enterpriseId", authorize([Role.ADMIN]), updateEnterprise);
router.delete("/:enterpriseId", authorize([Role.ADMIN]), deleteEnterprise);

export default router;
