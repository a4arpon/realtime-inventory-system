/*
  Warnings:

  - You are about to drop the column `totalStock` on the `Drop` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `session` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sessionId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_session_key";

-- AlterTable
ALTER TABLE "Drop" DROP COLUMN "totalStock";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
DROP COLUMN "session",
ADD COLUMN     "sessionId" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_sessionId_key" ON "User"("sessionId");
