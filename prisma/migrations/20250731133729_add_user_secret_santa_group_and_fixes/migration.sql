/*
  Warnings:

  - You are about to drop the column `userId` on the `secret_santa_groups` table. All the data in the column will be lost.
  - The primary key for the `wishlist_items_secret_santa_groups` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `wishlist_items_secret_santa_groups` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `wishlist_items_secret_santa_groups` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerId,name]` on the table `secret_santa_groups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `secret_santa_groups` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."secret_santa_groups" DROP CONSTRAINT "secret_santa_groups_userId_fkey";

-- DropIndex
DROP INDEX "public"."wishlist_items_secret_santa_groups_wishlistItemId_secretSan_key";

-- AlterTable
ALTER TABLE "public"."secret_santa_groups" RENAME COLUMN "userId" TO "ownerId";


-- AlterTable
ALTER TABLE "public"."wishlist_items_secret_santa_groups" DROP CONSTRAINT "wishlist_items_secret_santa_groups_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
ADD CONSTRAINT "wishlist_items_secret_santa_groups_pkey" PRIMARY KEY ("wishlistItemId", "secretSantaGroupId");

-- CreateTable
CREATE TABLE "public"."users_secret_santa_groups" (
    "userId" TEXT NOT NULL,
    "secretSantaGroupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_secret_santa_groups_pkey" PRIMARY KEY ("userId","secretSantaGroupId")
);

-- CreateIndex
CREATE UNIQUE INDEX "secret_santa_groups_ownerId_name_key" ON "public"."secret_santa_groups"("ownerId", "name");

-- AddForeignKey
ALTER TABLE "public"."secret_santa_groups" ADD CONSTRAINT "secret_santa_groups_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users_secret_santa_groups" ADD CONSTRAINT "users_secret_santa_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users_secret_santa_groups" ADD CONSTRAINT "users_secret_santa_groups_secretSantaGroupId_fkey" FOREIGN KEY ("secretSantaGroupId") REFERENCES "public"."secret_santa_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
