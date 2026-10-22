import type { RequestHandler } from "express";
import {
  RequestCvUploadUrlBody,
  RequestCvUploadUrlResponse,
} from "@workspace/api-zod";
import { ApiError } from "../errors/ApiError";
import { cvUploadsService } from "../services/cv-uploads.service";
import { validationFields } from "./validation";

export class CvUploadsController {
  requestUrl: RequestHandler = async (req, res) => {
    const parsed = RequestCvUploadUrlBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "CV must be a PDF no larger than 5 MB.",
        fields: { cv: "Choose a PDF file no larger than 5 MB." },
      });
      return;
    }
    
    res.json(
      RequestCvUploadUrlResponse.parse(
        await cvUploadsService.requestUrl(parsed.data),
      ),
    );
  };

  store: RequestHandler = async (req, res) => {
    const id = String(req.params["id"] ?? "");
    const contentType = req.get("content-type")?.split(";")[0].trim();
    if (contentType !== "application/pdf" || !Buffer.isBuffer(req.body)) {
      throw new ApiError(400, "Upload a PDF file using application/pdf.");
    }
    await cvUploadsService.storeLocalUpload(id, req.body);
    res.status(204).end();
  };
}

export const cvUploadsController = new CvUploadsController();
