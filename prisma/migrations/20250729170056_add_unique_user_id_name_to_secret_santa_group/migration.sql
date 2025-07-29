/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `secret_santa_groups` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "secret_santa_groups_userId_name_key" ON "secret_santa_groups"("userId", "name");
