import { prisma } from "@workspace/db";

export class CvUploadRepository {
  create(data: {
    objectPath: string;
    originalName: string;
    declaredSize: number;
  }) {
    return prisma.cvUpload.create({ data });
  }

  findByObjectPath(objectPath: string) {
    return prisma.cvUpload.findUnique({ where: { objectPath } });
  }
}
