/*
  Warnings:

  - Added the required column `period_id` to the `uploads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `site_id` to the `uploads` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_uploads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "period_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "s3_key" TEXT,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "uploads_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "uploads_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "uploads_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "reporting_periods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "uploads_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_uploads" ("customer_id", "error_count", "filename", "id", "s3_key", "status", "uploaded_at", "uploaded_by") SELECT "customer_id", "error_count", "filename", "id", "s3_key", "status", "uploaded_at", "uploaded_by" FROM "uploads";
DROP TABLE "uploads";
ALTER TABLE "new_uploads" RENAME TO "uploads";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
