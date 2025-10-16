/*
  Warnings:

  - Added the required column `updated_at` to the `emission_factors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `uploads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sites" ADD COLUMN "region" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_emission_factors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "geography" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "input_unit" TEXT NOT NULL,
    "output_unit" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "source_name" TEXT NOT NULL,
    "source_version" TEXT NOT NULL,
    "gwp_version" TEXT NOT NULL,
    "valid_from" DATETIME NOT NULL,
    "valid_to" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_emission_factors" ("category", "created_at", "geography", "gwp_version", "id", "input_unit", "output_unit", "source_name", "source_version", "valid_from", "valid_to", "value", "year") SELECT "category", "created_at", "geography", "gwp_version", "id", "input_unit", "output_unit", "source_name", "source_version", "valid_from", "valid_to", "value", "year" FROM "emission_factors";
DROP TABLE "emission_factors";
ALTER TABLE "new_emission_factors" RENAME TO "emission_factors";
CREATE TABLE "new_uploads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "period_id" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "s3_key" TEXT,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "uploads_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "uploads_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "uploads_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "reporting_periods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "uploads_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_uploads" ("customer_id", "error_count", "filename", "id", "original_filename", "period_id", "s3_key", "site_id", "status", "uploaded_at", "uploaded_by") SELECT "customer_id", "error_count", "filename", "id", "original_filename", "period_id", "s3_key", "site_id", "status", "uploaded_at", "uploaded_by" FROM "uploads";
DROP TABLE "uploads";
ALTER TABLE "new_uploads" RENAME TO "uploads";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
