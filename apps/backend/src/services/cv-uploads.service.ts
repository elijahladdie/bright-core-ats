import { ApiError } from "../errors/ApiError";
import { CvStorageRepository } from "../repositories/cv-storage.repository";
import { CvUploadRepository } from "../repositories/cv-upload.repository";

const maxCvBytes = 5 * 1024 * 1024;
const uploadIdPattern = /^[0-9a-f-]{36}$/i;

export class CvUploadsService {
  constructor(
    private readonly uploads = new CvUploadRepository(),
    private readonly storage = new CvStorageRepository(),
  ) {}

  async requestUrl(input: {
    name: string;
    size: number;
    contentType: string;
  }) {
    if (
      input.size < 5 ||
      input.size > maxCvBytes ||
      !input.name.toLowerCase().endsWith(".pdf") ||
      input.contentType !== "application/pdf"
    ) {
      throw new ApiError(400, "CV must be a PDF no larger than 5 MB.", {
        cv: "Choose a PDF file no larger than 5 MB.",
      });
    }

    const upload = await this.storage.createUpload();
    await this.uploads.create({
      objectPath: upload.objectPath,
      originalName: input.name.slice(0, 255),
      declaredSize: input.size,
    });
    return upload;
  }

  async storeLocalUpload(id: string, contents: Buffer): Promise<void> {
    if (!uploadIdPattern.test(id)) {
      throw new ApiError(400, "Invalid CV upload ID.");
    }
    const upload = await this.uploads.findByObjectPath(
      `/objects/uploads/${id}`,
    );
    if (!upload) {
      throw new ApiError(404, "CV upload was not found.");
    }
    if (upload.declaredSize !== contents.length) {
      throw new ApiError(400, "Uploaded file size does not match the request.");
    }

    try {
      await this.storage.storeLocalUpload(id, contents);
    } catch (error) {
      throw new ApiError(
        400,
        error instanceof Error ? error.message : "Unable to store the CV.",
      );
    }
  }
}

export const cvUploadsService = new CvUploadsService();
