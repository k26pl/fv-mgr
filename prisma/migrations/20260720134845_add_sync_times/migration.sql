-- CreateTable
CREATE TABLE "SyncTimers" (
    "hour_min" INTEGER NOT NULL,

    CONSTRAINT "SyncTimers_pkey" PRIMARY KEY ("hour_min")
);

-- CreateIndex
CREATE UNIQUE INDEX "SyncTimers_hour_min_key" ON "SyncTimers"("hour_min");
