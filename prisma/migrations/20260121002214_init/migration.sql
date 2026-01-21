-- CreateTable
CREATE TABLE "weeks" (
    "id" SERIAL NOT NULL,
    "week_start" DATE NOT NULL,
    "week_end" DATE NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_entries" (
    "id" SERIAL NOT NULL,
    "week_id" INTEGER NOT NULL,
    "employee_name" VARCHAR(100) NOT NULL,
    "date" DATE NOT NULL,
    "day_of_week" VARCHAR(10) NOT NULL,
    "shift" VARCHAR(10) NOT NULL,
    "location" VARCHAR(20) NOT NULL,
    "note_type" VARCHAR(10),
    "note_time" VARCHAR(5),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" SERIAL NOT NULL,
    "sync_type" VARCHAR(20) NOT NULL,
    "status" VARCHAR(10) NOT NULL,
    "message" TEXT,
    "records_synced" INTEGER NOT NULL DEFAULT 0,
    "duration_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "weeks_week_start_key" ON "weeks"("week_start");

-- CreateIndex
CREATE INDEX "schedule_entries_week_id_idx" ON "schedule_entries"("week_id");

-- CreateIndex
CREATE INDEX "schedule_entries_employee_name_idx" ON "schedule_entries"("employee_name");

-- CreateIndex
CREATE INDEX "schedule_entries_date_idx" ON "schedule_entries"("date");

-- CreateIndex
CREATE INDEX "schedule_entries_location_idx" ON "schedule_entries"("location");

-- CreateIndex
CREATE INDEX "schedule_entries_week_id_location_idx" ON "schedule_entries"("week_id", "location");

-- AddForeignKey
ALTER TABLE "schedule_entries" ADD CONSTRAINT "schedule_entries_week_id_fkey" FOREIGN KEY ("week_id") REFERENCES "weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
