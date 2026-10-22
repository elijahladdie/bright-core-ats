import { Router, type IRouter } from "express";
import { publicJobsController } from "../controllers/public-jobs.controller";

const router: IRouter = Router();

router.get("/jobs", publicJobsController.list);
router.get("/jobs/:id", publicJobsController.get);
router.post("/jobs/:id/applications", publicJobsController.apply);

export default router;
