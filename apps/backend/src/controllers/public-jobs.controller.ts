import type { RequestHandler } from "express";
import {
  ApplyToJobBody,
  ApplyToJobParams,
  ApplyToJobResponse,
  GetJobParams,
  GetJobResponse,
  ListJobsQueryParams,
  ListJobsResponse,
} from "@workspace/api-zod";
import { publicJobsService } from "../services/public-jobs.service";
import { validationFields } from "./validation";

export class PublicJobsController {
  list: RequestHandler = async (req, res) => {
    const parsed = ListJobsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid job search parameters." });
      return;
    }
    res.json(ListJobsResponse.parse(await publicJobsService.listJobs(parsed.data)));
  };

  get: RequestHandler = async (req, res) => {
    const params = GetJobParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid job ID." });
      return;
    }
    res.json(GetJobResponse.parse(await publicJobsService.getJob(params.data.id)));
  };

  apply: RequestHandler = async (req, res) => {
    const params = ApplyToJobParams.safeParse(req.params);
    const parsed = ApplyToJobBody.safeParse(req.body);
    if (!params.success || !parsed.success) {
      res.status(400).json({
        error: "Please check the application details.",
        fields: parsed.success ? {} : validationFields(parsed.error),
      });
      return;
    }
    const result = await publicJobsService.apply(params.data.id, parsed.data);
    res.status(201).json(ApplyToJobResponse.parse(result));
  };
}

export const publicJobsController = new PublicJobsController();
