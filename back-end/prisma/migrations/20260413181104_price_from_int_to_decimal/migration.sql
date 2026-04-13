/*
  Warnings:

  - You are about to drop the column `priceCents` on the `Drop` table. All the data in the column will be lost.
  - Added the required column `price` to the `Drop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Drop" DROP COLUMN "priceCents",
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "totalStock" SET DEFAULT 0,
ALTER COLUMN "availableStock" SET DEFAULT 0;
