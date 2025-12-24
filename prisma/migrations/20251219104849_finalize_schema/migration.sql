/*
  Warnings:

  - The values [AWAITING_ACCEPTANCE] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `audio` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `shop_session` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Shopper` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Shopper` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Shopper` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Shopper` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'SHOPPER_ASSIGNED', 'PICKING', 'DELIVERING', 'DELIVERED', 'CANCELLED');
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
ALTER TYPE "SenderRole" ADD VALUE 'SYSTEM';

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_userId_fkey";

-- DropForeignKey
ALTER TABLE "Shopper" DROP CONSTRAINT "Shopper_userId_fkey";

-- DropIndex
DROP INDEX "Customer_userId_key";

-- DropIndex
DROP INDEX "Shopper_userId_key";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "audio",
ADD COLUMN     "voiceNote" TEXT;

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "shop_session",
ADD COLUMN     "shopSession" TEXT;

-- AlterTable
ALTER TABLE "Shopper" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "UserRole";

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_shopperId_idx" ON "Order"("shopperId");

-- CreateIndex
CREATE INDEX "Order_marketId_idx" ON "Order"("marketId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Shopper_email_key" ON "Shopper"("email");
