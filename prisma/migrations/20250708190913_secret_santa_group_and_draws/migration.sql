-- AlterTable
ALTER TABLE "users" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "secret_santa_groups" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(255) NOT NULL,
    "slug" TEXT NOT NULL,
    "priceLimit" INTEGER,
    "drawDate" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "secret_santa_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secret_santa_draws" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupId" TEXT NOT NULL,
    "giverId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,

    CONSTRAINT "secret_santa_draws_pkey" PRIMARY KEY ("groupId", "giverId")
);

-- CreateTable
CREATE TABLE "wishlist_items_secret_santa_groups" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wishlistItemId" TEXT NOT NULL,
    "secretSantaGroupId" TEXT NOT NULL,

    CONSTRAINT "wishlist_items_secret_santa_groups_pkey" PRIMARY KEY ("id")
);


-- CreateIndex
CREATE UNIQUE INDEX "secret_santa_draws_groupId_receiverId_key" ON "secret_santa_draws"("groupId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "secret_santa_groups_slug_key" ON "public"."secret_santa_groups"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_secret_santa_groups_wishlistItemId_secretSan_key" ON "wishlist_items_secret_santa_groups"("wishlistItemId", "secretSantaGroupId");

-- AddForeignKey
ALTER TABLE "secret_santa_groups" ADD CONSTRAINT "secret_santa_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secret_santa_draws" ADD CONSTRAINT "secret_santa_draws_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "secret_santa_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secret_santa_draws" ADD CONSTRAINT "secret_santa_draws_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secret_santa_draws" ADD CONSTRAINT "secret_santa_draws_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items_secret_santa_groups" ADD CONSTRAINT "wishlist_items_secret_santa_groups_wishlistItemId_fkey" FOREIGN KEY ("wishlistItemId") REFERENCES "wishlist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items_secret_santa_groups" ADD CONSTRAINT "wishlist_items_secret_santa_groups_secretSantaGroupId_fkey" FOREIGN KEY ("secretSantaGroupId") REFERENCES "secret_santa_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
