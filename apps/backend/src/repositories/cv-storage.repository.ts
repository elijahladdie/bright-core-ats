import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Readable } from "node:stream";

const maxCvBytes = 5 * 1024 * 1024;
const uploadIdPattern = /^[0-9a-f-]{36}$/i;
const objectPathPattern = /^\/objects\/uploads\/([0-9a-f-]{36})$/i;

export interface StoredCvFile {
  getSize(): Promise<number>;
  readHeader(): Promise<Buffer>;
  createReadStream(): Readable;
}

class LocalCvFile implements StoredCvFile {
  constructor(private readonly path: string) {}

  async getSize(): Promise<number> {
    return (await stat(this.path)).size;
  }

  async readHeader(): Promise<Buffer> {
    const contents = await readFile(this.path);
    return contents.subarray(0, 5);
  }

  createReadStream(): Readable {
    return createReadStream(this.path);
  }
}




export class CvStorageRepository {
  async createUpload(): Promise<{ uploadURL: string; objectPath: string }> {
    const id = randomUUID();
    const objectPath = `/objects/uploads/${id}`;

    return {
      uploadURL: `/api/storage/uploads/${id}`,
      objectPath,
    };
  }

  async storeLocalUpload(id: string, contents: Buffer): Promise<void> {
    if (!uploadIdPattern.test(id)) {
      throw new Error("Invalid CV upload ID.");
    }

    if (
      contents.length < 5 ||
      contents.length > maxCvBytes ||
      !contents.subarray(0, 5).toString("ascii").startsWith("%PDF-")
    ) {
      throw new Error(
        "The uploaded CV must be a valid PDF no larger than 5 MB.",
      );
    }

    const directory = this.localUploadDirectory();
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, id), contents, { flag: "w" });
  }

  async getPrivateObject(objectPath: string): Promise<StoredCvFile> {
    const match = objectPathPattern.exec(objectPath);

    if (!match) {
      throw new Error("Invalid CV object path.");
    }

    const id = match[1];
    const filePath = join(this.localUploadDirectory(), id);

    await access(filePath);

    return new LocalCvFile(filePath);
  }

  async isPdfFile(file: StoredCvFile): Promise<boolean> {
    const size = await file.getSize();

    if (size < 5 || size > maxCvBytes) {
      return false;
    }

    return (await file.readHeader()).toString("ascii").startsWith("%PDF-");
  }

  private localUploadDirectory(): string {
    return resolve(process.env.CV_UPLOAD_DIR ?? "data/cv-uploads");
  }
}

