/*
  Warnings:

  - A unique constraint covering the columns `[site_id,period_id,type,activity_date_start]` on the table `activities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "activities_site_id_period_id_type_activity_date_start_key" ON "activities"("site_id", "period_id", "type", "activity_date_start");
