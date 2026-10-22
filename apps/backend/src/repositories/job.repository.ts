import type { Prisma } from "@prisma/client";
import { prisma } from "@workspace/db";

export type JobWriteInput = {
  title: string;
  location: string;
  employmentType: string;
  closingDate: Date;
  summary: string;
  description: string;
  responsibilities: string;
  requirements: string;
  status?: string;
};

export type PublicJobFilters = {
  search?: string;
  type?: string;
  page: number;
  limit: number;
  today: Date;
};

export class JobRepository {
  async listOpen(filters: PublicJobFilters) {
    const searchTerm = filters.search?.trim();
    const where: Prisma.JobWhereInput = {
      status: "OPEN",
      closingDate: { gte: filters.today },
      ...(searchTerm
        ? {
            OR: [
              { title: { contains: searchTerm, mode: "insensitive" } },
              { location: { contains: searchTerm, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filters.type?.trim() ? { employmentType: filters.type } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        orderBy: [{ closingDate: "asc" }, { id: "asc" }],
        take: filters.limit,
        skip: (filters.page - 1) * filters.limit,
      }),
    ]);

    return { total, items };
  }

  findById(id: number) {
    return prisma.job.findUnique({ where: { id } });
  }

  listForAdmin() {
    return prisma.job.findMany({
      include: { _count: { select: { applications: true } } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

  create(data: JobWriteInput) {
    return prisma.job.create({ data });
  }

  update(id: number, data: JobWriteInput) {
    return prisma.job.updateMany({ where: { id }, data });
  }

  close(id: number) {
    return prisma.job.updateMany({
      where: { id },
      data: { status: "CLOSED" },
    });
  }

  countApplications(id: number) {
    return prisma.application.count({ where: { jobId: id } });
  }

  listForOverview() {
    return prisma.job.findMany({
      select: { id: true, title: true, status: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findAny() {
    return prisma.job.findFirst({ select: { id: true } });
  }

  createMany(data: JobWriteInput[]) {
    return prisma.job.createMany({ data });
  }
}
