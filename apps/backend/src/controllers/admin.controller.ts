import type { RequestHandler } from "express";
import {
  AdminLoginBody,
  AdminLoginResponse,
  CloseJobParams,
  CloseJobResponse,
  CreateJobBody,
  CreateJobResponse,
  GetAdminOverviewResponse,
  GetApplicationParams,
  GetApplicationResponse,
  GetApplicationCvParams,
  ListAdminApplicationsQueryParams,
  ListAdminApplicationsResponse,
  ListAdminJobsResponse,
  ListApplicationsParams,
  ListApplicationsResponse,
  UpdateApplicationStatusBody,
  UpdateApplicationStatusParams,
  UpdateApplicationStatusResponse,
  UpdateJobBody,
  UpdateJobParams,
  UpdateJobResponse,
} from "@workspace/api-zod";
import { adminService } from "../services/admin.service";
import { validationFields } from "./validation";

export class AdminController {
  login: RequestHandler = async (req, res) => {
    const parsed = AdminLoginBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Enter a valid email and password.",
        fields: validationFields(parsed.error),
      });
      return;
    }
    res.json(AdminLoginResponse.parse(await adminService.login(parsed.data)));
  };

  listJobs: RequestHandler = async (_req, res) => {
    res.json(ListAdminJobsResponse.parse(await adminService.listJobs()));
  };

  createJob: RequestHandler = async (req, res) => {
    const parsed = CreateJobBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Please correct the job details.",
        fields: validationFields(parsed.error),
      });
      return;
    }
    const result = await adminService.createJob(parsed.data);
    res.status(201).json(CreateJobResponse.parse(result));
  };

  updateJob: RequestHandler = async (req, res) => {
    const params = UpdateJobParams.safeParse(req.params);
    const parsed = UpdateJobBody.safeParse(req.body);
    if (!params.success || !parsed.success) {
      res.status(400).json({
        error: "Please correct the job details.",
        fields: parsed.success ? {} : validationFields(parsed.error),
      });
      return;
    }
    res.json(
      UpdateJobResponse.parse(
        await adminService.updateJob(params.data.id, parsed.data),
      ),
    );
  };

  closeJob: RequestHandler = async (req, res) => {
    const params = CloseJobParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid job ID." });
      return;
    }
    res.json(CloseJobResponse.parse(await adminService.closeJob(params.data.id)));
  };

  listApplicationsForJob: RequestHandler = async (req, res) => {
    const params = ListApplicationsParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid job ID." });
      return;
    }
    const status =
      typeof req.query.status === "string" &&
      ["PENDING", "ACCEPTED", "REJECTED"].includes(req.query.status)
        ? req.query.status
        : undefined;
    const applications = await adminService.listApplicationsForJob(
      params.data.id,
      status,
    );
    res.json(ListApplicationsResponse.parse(applications));
  };

  listApplications: RequestHandler = async (req, res) => {
    const parsed = ListAdminApplicationsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid application filters." });
      return;
    }
    res.json(
      ListAdminApplicationsResponse.parse(
        await adminService.listApplications(parsed.data),
      ),
    );
  };

  getApplication: RequestHandler = async (req, res) => {
    const params = GetApplicationParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid application ID." });
      return;
    }
    res.json(
      GetApplicationResponse.parse(
        await adminService.getApplication(params.data.id),
      ),
    );
  };

  downloadApplicationCv: RequestHandler = async (req, res) => {
    const params = GetApplicationCvParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid application ID." });
      return;
    }
    const { file, filename } = await adminService.getApplicationCv(
      params.data.id,
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "private, no-store");
    const stream = file.createReadStream();
    stream.on("error", (error) => {
      req.log.error(
        { err: error, applicationId: params.data.id },
        "CV download stream failed",
      );
      if (!res.headersSent) {
        res.status(500).json({ error: "Unable to download the CV." });
      } else {
        res.destroy(error);
      }
    });
    stream.pipe(res);
  };

  updateApplicationStatus: RequestHandler = async (req, res) => {
    const params = UpdateApplicationStatusParams.safeParse(req.params);
    const parsed = UpdateApplicationStatusBody.safeParse(req.body);
    if (!params.success || !parsed.success) {
      res.status(400).json({
        error: "Choose Accepted or Rejected.",
        fields: parsed.success ? {} : validationFields(parsed.error),
      });
      return;
    }
    res.json(
      UpdateApplicationStatusResponse.parse(
        await adminService.updateApplicationStatus(
          params.data.id,
          parsed.data,
        ),
      ),
    );
  };

  overview: RequestHandler = async (_req, res) => {
    res.json(
      GetAdminOverviewResponse.parse(await adminService.getOverview()),
    );
  };
}

export const adminController = new AdminController();
