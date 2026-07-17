/*
  Warnings:

  - Added the required column `account_number` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_number` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brutto_price` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyNip` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netto_price` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_deadline` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vat` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvoiceSource" AS ENUM ('KSEF', 'UPLOAD', 'MANUAL');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "account_number" TEXT NOT NULL,
ADD COLUMN     "defaultCategoryName" TEXT;

-- AlterTable
ALTER TABLE "DocType" ALTER COLUMN "is_system" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "accepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "account_number" TEXT NOT NULL,
ADD COLUMN     "attachment" TEXT,
ADD COLUMN     "brutto_price" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "categoryName" TEXT,
ADD COLUMN     "companyNip" BIGINT NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ksef_id" TEXT,
ADD COLUMN     "netto_price" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "payment_deadline" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "source" "InvoiceSource" NOT NULL,
ADD COLUMN     "vat" DECIMAL(65,30) NOT NULL;

-- CreateTable
CREATE TABLE "Category" (
    "name" TEXT NOT NULL,
    "parentName" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadError" BOOLEAN NOT NULL,
    "uploadFinished" BOOLEAN NOT NULL,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UploadedFile_id_key" ON "UploadedFile"("id");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentName_fkey" FOREIGN KEY ("parentName") REFERENCES "Category"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_defaultCategoryName_fkey" FOREIGN KEY ("defaultCategoryName") REFERENCES "Category"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_companyNip_fkey" FOREIGN KEY ("companyNip") REFERENCES "Company"("nip") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_categoryName_fkey" FOREIGN KEY ("categoryName") REFERENCES "Category"("name") ON DELETE SET NULL ON UPDATE CASCADE;
