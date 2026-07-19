/*
  Warnings:

  - You are about to drop the column `attachment` on the `Invoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "attachment";

-- AlterTable
ALTER TABLE "UploadedFile" ADD COLUMN     "invoiceId" TEXT;

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
