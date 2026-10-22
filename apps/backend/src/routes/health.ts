import { Router, type IRouter } from "express";
import { healthController } from "../controllers/health.controller";

const router: IRouter = Router();

router.get("/healthz", healthController.get);

export default router;
