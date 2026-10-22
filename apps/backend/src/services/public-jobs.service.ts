import type { z } from "zod";
import {
  ApplyToJobBody,
  ListJobsQueryParams,
} from "@workspace/api-zod";
import { ApiError } from "../errors/ApiError";
import { ApplicationRepository } from "../repositories/application.repository";
import { CvStorageRepository } from "../repositories/cv-storage.repository";
import { CvUploadRepository } from "../repositories/cv-upload.repository";
import { JobRepository } from "../repositories/job.repository";

type JobFilters = z.infer<typeof ListJobsQueryParams>;
type ApplicationInput = z.infer<typeof ApplyToJobBody>;

const maxCvBytes = 5 * 1024 * 1024;

export class PublicJobsService {
  constructor(
    private readonly jobs = new JobRepository(),
    private readonly applications = new ApplicationRepository(),
    private readonly cvUploads = new CvUploadRepository(),
    private readonly cvStorage = new CvStorageRepository(),
  ) {}

  async listJobs(filters: JobFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 6;
    const { items, total } = await this.jobs.listOpen({
      search: filters.search,
      type: filters.type,
      page,
      limit,
      today: this.startOfToday(),
    });
    return { items, page, limit, total };
  }

  async getJob(id: number) {
    const job = await this.jobs.findById(id);
    if (!job) {
      throw new ApiError(404, "Job not found.");
    }
    return job;
  }

  async apply(jobId: number, input: ApplicationInput) {
    if (!/^[+()\-\s\d.]{7,25}$/.test(input.phone)) {
      throw new ApiError(400, "Please check the application details.", {
        phone: "Enter a valid phone number.",
      });
    }
    if (!/^\/objects\/uploads\/[0-9a-f-]{36}$/i.test(input.cvObjectPath)) {
      throw new ApiError(400, "Please upload a PDF CV before submitting.", {
        cv: "The CV upload could not be verified. 1",
      });
    }

    const job = await this.jobs.findById(jobId);
    if (
      !job ||
      job.status !== "OPEN" ||
      job.closingDate < this.startOfToday()
    ) {
      throw new ApiError(400, "This job is no longer accepting applications.");
    }

    const upload = await this.cvUploads.findByObjectPath(input.cvObjectPath);
    if (!upload || upload.originalName !== input.cvOriginalName) {
      throw new ApiError(400, "Please upload a PDF CV before submitting.", {
        cv: "The CV upload could not be verified. 2",
      });
    }

    try {
      const file = await this.cvStorage.getPrivateObject(input.cvObjectPath);
      const actualSize = await file.getSize();
      if (
        actualSize !== upload.declaredSize ||
        actualSize > maxCvBytes ||
        !(await this.cvStorage.isPdfFile(file))
      ) {
        throw new ApiError(
          400,
          "The uploaded CV must be a valid PDF no larger than 5 MB.",
          { cv: "Choose a valid PDF file no larger than 5 MB." },
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(400, "Please upload a PDF CV before submitting.", {
        cv: "The CV upload could not be verified. 3",
      });
    }

    try {
      const created = await this.applications.create({
        jobId: job.id,
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        coverNote: input.coverNote.trim(),
        cvObjectPath: input.cvObjectPath,
        cvOriginalName: upload.originalName,
      });
      return {
        id: created.id,
        message: "Your application has been submitted successfully.",
      };
    } catch (error) {
      const prismaCode =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";
      if (prismaCode === "P2002") {
        throw new ApiError(
          409,
          "An application with this email has already been submitted for this job.",
          { email: "You have already applied to this job with this email." },
        );
      }
      throw error;
    }
  }

  private startOfToday(): Date {
    return new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
  }
}

export const publicJobsService = new PublicJobsService();
