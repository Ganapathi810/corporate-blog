import { Router } from "express";
import { updateUserSchema } from "../../schemas/user.schema.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { deleteUser, getUsers, updateUser, getUserBySlug } from "./user.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { Role } from "../../generated/prisma/index.js";

const router = Router();

router.get('/slug/:slug', getUserBySlug);

router.use(requireAuth);

router.get('/', requireRole(Role.ADMIN), getUsers);
router.patch('/:id', requireRole(Role.ADMIN), validate(updateUserSchema), updateUser);
router.delete('/:id', requireRole(Role.ADMIN), deleteUser);


export { router as userRouter }