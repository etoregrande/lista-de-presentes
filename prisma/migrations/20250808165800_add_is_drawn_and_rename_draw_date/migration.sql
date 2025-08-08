-- AlterTable
ALTER TABLE secret_santa_groups
  RENAME COLUMN "drawDate" TO "estimateDrawDate";

-- AlterTable
ALTER TABLE secret_santa_groups
  ADD COLUMN "isDrawn" BOOLEAN NOT NULL DEFAULT false;