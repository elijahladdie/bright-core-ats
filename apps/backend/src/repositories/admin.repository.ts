import { prisma } from "@workspace/db";

export class AdminRepository {
  findByEmail(email: string) {
    return prisma.admin.findUnique({ where: { email } });
  }

  findAny() {
    return prisma.admin.findFirst({ select: { id: true } });
  }

  create(data: { email: string; passwordHash: string }) {
    return prisma.admin.create({ data });
  }
}
