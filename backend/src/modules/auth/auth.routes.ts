import express from "express";
import { getUserSession } from "./auth.controller.js";

const router = express.Router();

router.get('/me', getUserSession)


export { router as authRouter }
