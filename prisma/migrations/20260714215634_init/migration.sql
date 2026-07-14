-- CreateTable
CREATE TABLE "DocType" (
    "name" TEXT NOT NULL,
    "is_outgoing" BOOLEAN NOT NULL,
    "is_system" BOOLEAN NOT NULL,

    CONSTRAINT "DocType_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Company" (
    "nip" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "adress" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("nip")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "docTypeName" TEXT NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocType_name_key" ON "DocType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_nip_key" ON "Company"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_id_key" ON "Invoice"("id");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_docTypeName_fkey" FOREIGN KEY ("docTypeName") REFERENCES "DocType"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
