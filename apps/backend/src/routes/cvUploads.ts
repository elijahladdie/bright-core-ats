import express, { Router, type IRouter } from "express";
import { cvUploadsController } from "../controllers/cv-uploads.controller";

const router: IRouter = Router();

router.post("/storage/uploads/request-url", cvUploadsController.requestUrl);
router.put(
  "/storage/uploads/:id",
  express.raw({ type: "application/pdf", limit: "5mb" }),
  cvUploadsController.store,
);

export default router;
