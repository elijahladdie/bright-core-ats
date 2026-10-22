import type { RequestHandler } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

export class HealthController {
  get: RequestHandler = (_req, res) => {
    res.json(HealthCheckResponse.parse({ status: "ok" }));
  };
}

export const healthController = new HealthController();
