-- DropForeignKey
ALTER TABLE "public"."secret_santa_draws" DROP CONSTRAINT "secret_santa_draws_groupId_fkey";

-- AddForeignKey
ALTER TABLE "public"."secret_santa_draws" ADD CONSTRAINT "secret_santa_draws_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."secret_santa_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
