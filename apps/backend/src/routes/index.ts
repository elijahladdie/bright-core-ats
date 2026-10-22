import { Router, type IRouter } from "express";
import adminRouter from "./admin";
import cvUploadsRouter from "./cvUploads";
import healthRouter from "./health";
import publicJobsRouter from "./publicJobs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(publicJobsRouter);
router.use(adminRouter);
router.use(cvUploadsRouter);

export default router;
