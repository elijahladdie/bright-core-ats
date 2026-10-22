import type { Prisma } from "@prisma/client";
import { prisma } from "@workspace/db";

export type NewApplicationInput = {
  jobId: number;
  fullName: string;
  email: string;
  phone: string;
  coverNote: string;
  cvObjectPath: string;
  cvOriginalName: string;
};

export class ApplicationRepository {
  create(data: NewApplicationInput) {
    return prisma.application.create({
      data,
      select: { id: true },
    });
  }

  listForJob(jobId: number, status?: string) {
    return prisma.application.findMany({
      where: { jobId, ...(status ? { status } : {}) },
      select: {
        id: true,
        jobId: true,
        fullName: true,
        email: true,
        phone: true,
        coverNote: true,
        status: true,
        note: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

  listForAdmin(filters: { jobId?: number; status?: string }) {
    const where: Prisma.ApplicationWhereInput = {
      ...(filters.jobId ? { jobId: filters.jobId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    };
    return prisma.application.findMany({
      where,
      select: {
        id: true,
        jobId: true,
        fullName: true,
        email: true,
        phone: true,
        coverNote: true,
        status: true,
        note: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

  findDetail(id: number) {
    return prisma.application.findUnique({
      where: { id },
      select: {
        id: true,
        jobId: true,
        fullName: true,
        email: true,
        phone: true,
        coverNote: true,
        status: true,
        note: true,
        createdAt: true,
        cvOriginalName: true,
        job: { select: { title: true } },
      },
    });
  }

  findCv(id: number) {
    return prisma.application.findUnique({
      where: { id },
      select: { cvObjectPath: true, cvOriginalName: true },
    });
  }

  findStatus(id: number) {
    return prisma.application.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
  }

  updatePending(
    id: number,
    data: { status: string; note: string | null },
  ) {
    return prisma.application.updateMany({
      where: { id, status: "PENDING" },
      data,
    });
  }

  listForOverview() {
    return prisma.application.findMany({
      select: { jobId: true, status: true },
    });
  }
}
