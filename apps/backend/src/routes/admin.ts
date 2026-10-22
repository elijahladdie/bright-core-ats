import { Router, type IRouter } from "express";
import { requireAdmin } from "../middlewares/adminAuth";
import { adminController } from "../controllers/admin.controller";

const router: IRouter = Router();

router.post("/admin/login", adminController.login);
router.use("/admin", requireAdmin);
router.get("/admin/jobs", adminController.listJobs);
router.post("/admin/jobs", adminController.createJob);
router.put("/admin/jobs/:id", adminController.updateJob);
router.patch("/admin/jobs/:id/close", adminController.closeJob);
router.get(
  "/admin/jobs/:id/applications",
  adminController.listApplicationsForJob,
);
router.get("/admin/applications", adminController.listApplications);
router.get("/admin/applications/:id", adminController.getApplication);
router.get(
  "/admin/applications/:id/cv",
  adminController.downloadApplicationCv,
);
router.patch(
  "/admin/applications/:id/status",
  adminController.updateApplicationStatus,
);
router.get("/admin/overview", adminController.overview);

export default router;
