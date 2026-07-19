-- CreateTable
CREATE TABLE "KsefSyncState" (
    "companyNip" BIGINT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KsefSyncState_pkey" PRIMARY KEY ("companyNip")
);
