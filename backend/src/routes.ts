import { Router } from "express";
import { postRouter } from "./modules/post/post.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { userRouter } from "./modules/user/user.routes.js";
import { uploadRouter } from "./modules/upload/upload.routes.js";
import { auditLogRouter } from "./modules/audit-log/audit-log.routes.js";
import { categoryRouter } from "./modules/category/category.routes.js";



const router = Router();

router.use('/posts', postRouter);
router.use('/users', userRouter);
// router.use('/auth', authRouter); // Better Auth handles its own routes in app.ts
router.use('/upload', uploadRouter);
router.use('/audit-logs', auditLogRouter);
router.use('/categories', categoryRouter);



export { router as apiRouter }