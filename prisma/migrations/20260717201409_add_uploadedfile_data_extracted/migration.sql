-- AlterTable
ALTER TABLE "UploadedFile" ADD COLUMN     "dataExtracted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "uploadFinished" SET DEFAULT false;
