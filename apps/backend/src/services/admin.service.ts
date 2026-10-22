import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { z } from "zod";
import {
  AdminLoginBody,
  CloseJobResponse,
  CreateJobBody,
  CreateJobResponse,
  GetAdminOverviewResponse,
  GetApplicationResponse,
  ListAdminApplicationsQueryParams,
  ListAdminJobsResponse,
  ListApplicationsResponse,
  UpdateApplicationStatusBody,
  UpdateApplicationStatusResponse,
  UpdateJobBody,
  UpdateJobResponse,
} from "@workspace/api-zod";
import { getJwtSecret } from "../middlewares/adminAuth";
import { AdminRepository } from "../repositories/admin.repository";
import { ApplicationRepository } from "../repositories/application.repository";
import { CvStorageRepository } from "../repositories/cv-storage.repository";
import { JobRepository } from "../repositories/job.repository";
import { ApiError } from "../errors/ApiError";

type LoginInput = z.infer<typeof AdminLoginBody>;
type CreateJobInput = z.infer<typeof CreateJobBody>;
type UpdateJobInput = z.infer<typeof UpdateJobBody>;
type ApplicationFilters = z.infer<typeof ListAdminApplicationsQueryParams>;
type StatusInput = z.infer<typeof UpdateApplicationStatusBody>;

export class AdminService {
  constructor(
    private readonly admins = new AdminRepository(),
    private readonly jobs = new JobRepository(),
    private readonly applications = new ApplicationRepository(),
    private readonly cvStorage = new CvStorageRepository(),
  ) {}

  async login(input: LoginInput) {
    const email = input.email.trim().toLowerCase();
    const admin = await this.admins.findByEmail(email);
    if (!admin || !(await bcrypt.compare(input.password, admin.passwordHash))) {
      throw new ApiError(401, "Email or password is incorrect.");
    }

    const token = jwt.sign({ email: admin.email }, getJwtSecret(), {
      subject: admin.email,
      expiresIn: "8h",
    });
    return { token, email: admin.email };
  }

  async listJobs() {
    const rows = await this.jobs.listForAdmin();
    return rows.map(({ _count, ...job }) => ({
      ...job,
      applicationCount: _count.applications,
    }));
  }

  async createJob(input: CreateJobInput) {
    const job = await this.jobs.create({
      ...input,
      closingDate: this.normalizeDate(input.closingDate),
      status: "OPEN",
    });
    return CreateJobResponse.parse({ ...job, applicationCount: 0 });
  }

  async updateJob(id: number, input: UpdateJobInput) {
    const updated = await this.jobs.update(id, {
      ...input,
      closingDate: this.normalizeDate(input.closingDate),
    });
    if (!updated.count) {
      throw new ApiError(404, "Job not found.");
    }

    const [job, applicationCount] = await Promise.all([
      this.jobs.findById(id),
      this.jobs.countApplications(id),
    ]);
    if (!job) {
      throw new ApiError(404, "Job not found.");
    }
    return UpdateJobResponse.parse({ ...job, applicationCount });
  }

  async closeJob(id: number) {
    const updated = await this.jobs.close(id);
    if (!updated.count) {
      throw new ApiError(404, "Job not found.");
    }

    const [job, applicationCount] = await Promise.all([
      this.jobs.findById(id),
      this.jobs.countApplications(id),
    ]);
    if (!job) {
      throw new ApiError(404, "Job not found.");
    }
    return CloseJobResponse.parse({ ...job, applicationCount });
  }

  async listApplicationsForJob(jobId: number, status?: string) {
    return this.applications.listForJob(jobId, status);
  }

  async listApplications(filters: ApplicationFilters) {
    return this.applications.listForAdmin(filters);
  }

  async getApplication(id: number) {
    const application = await this.applications.findDetail(id);
    if (!application) {
      throw new ApiError(404, "Application not found.");
    }
    const { job, ...details } = application;
    return GetApplicationResponse.parse({ ...details, jobTitle: job.title });
  }

  async getApplicationCv(id: number) {
    const application = await this.applications.findCv(id);
    if (!application) {
      throw new ApiError(404, "Application or CV not found.");
    }

    try {
      const file = await this.cvStorage.getPrivateObject(
        application.cvObjectPath,
      );
      if (!(await this.cvStorage.isPdfFile(file))) {
        throw new Error("Stored file is not a valid PDF.");
      }
      const safeName = application.cvOriginalName
        .replace(/[\r\n"]/g, "")
        .replace(/[^\w.\- ]/g, "_")
        .slice(0, 180);
      return { file, filename: safeName };
    } catch {
      throw new ApiError(404, "CV file not found.");
    }
  }

  async updateApplicationStatus(id: number, input: StatusInput) {
    const updated = await this.applications.updatePending(id, {
      status: input.status,
      note: input.note?.trim() || null,
    });
    if (!updated.count) {
      const existing = await this.applications.findStatus(id);
      if (!existing) {
        throw new ApiError(404, "Application not found.");
      }
      throw new ApiError(400, "Only pending applications can be changed.");
    }
    return this.getApplication(id).then((application) =>
      UpdateApplicationStatusResponse.parse(application),
    );
  }

  async getOverview() {
    const [jobs, applications] = await Promise.all([
      this.jobs.listForOverview(),
      this.applications.listForOverview(),
    ]);

    const perJob = jobs.map((job) => {
      const jobApplications = applications.filter(
        (application) => application.jobId === job.id,
      );
      return {
        jobId: job.id,
        title: job.title,
        total: jobApplications.length,
        pending: jobApplications.filter((item) => item.status === "PENDING")
          .length,
        accepted: jobApplications.filter((item) => item.status === "ACCEPTED")
          .length,
        rejected: jobApplications.filter((item) => item.status === "REJECTED")
          .length,
      };
    });
    const summary = perJob.reduce(
      (totals, job) => ({
        totalApplications: totals.totalApplications + job.total,
        pending: totals.pending + job.pending,
        accepted: totals.accepted + job.accepted,
        rejected: totals.rejected + job.rejected,
      }),
      { totalApplications: 0, pending: 0, accepted: 0, rejected: 0 },
    );

    return GetAdminOverviewResponse.parse({
      ...summary,
      openJobs: jobs.filter((job) => job.status === "OPEN").length,
      perJob,
    });
  }

  private normalizeDate(value: Date): Date {
    return new Date(`${value.toISOString().slice(0, 10)}T00:00:00.000Z`);
  }
}

export const adminService = new AdminService();
