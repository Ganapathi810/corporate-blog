import { Router } from "express";
import { getAuditLogs } from "./audit-log.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { Role } from "../../generated/prisma/index.js";

const router = Router();

router.use(requireAuth);
router.get("/", requireRole(Role.ADMIN), getAuditLogs);

export { router as auditLogRouter };
