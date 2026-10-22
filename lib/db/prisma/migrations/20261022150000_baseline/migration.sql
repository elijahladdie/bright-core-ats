-- CreateTable
CREATE TABLE "brightcore_admins" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brightcore_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brightcore_jobs" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "employment_type" TEXT NOT NULL,
    "closing_date" DATE NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brightcore_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brightcore_applications" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cover_note" TEXT NOT NULL DEFAULT '',
    "cv_object_path" TEXT NOT NULL,
    "cv_original_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brightcore_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brightcore_cv_uploads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "object_path" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "declared_size" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brightcore_cv_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brightcore_admins_email_uq" ON "brightcore_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "brightcore_applications_job_email_uq" ON "brightcore_applications"("job_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "brightcore_cv_uploads_object_path_uq" ON "brightcore_cv_uploads"("object_path");

-- AddForeignKey
ALTER TABLE "brightcore_applications" ADD CONSTRAINT "brightcore_applications_job_id_brightcore_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "brightcore_jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
