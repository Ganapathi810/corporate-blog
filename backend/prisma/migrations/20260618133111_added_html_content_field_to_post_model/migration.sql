/*
  Warnings:

  - You are about to drop the column `ipHash` on the `PostView` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bannerImageId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[postId,dayString,ipUaHash]` on the table `PostView` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `action` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `entity` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `dayString` to the `PostView` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ipUaHash` to the `PostView` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PendingAction" AS ENUM ('EDIT_REQUEST', 'REMOVAL_REQUEST');

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'USER_DELETED';

-- DropForeignKey
ALTER TABLE "PostCategory" DROP CONSTRAINT "PostCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "PostCategory" DROP CONSTRAINT "PostCategory_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostView" DROP CONSTRAINT "PostView_postId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "action",
ADD COLUMN     "action" "AuditAction" NOT NULL,
DROP COLUMN "entity",
ADD COLUMN     "entity" "AuditEntity" NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "bannerImageId" TEXT,
ADD COLUMN     "editedByAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "editedByEditor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "htmlContent" TEXT,
ADD COLUMN     "originalPostId" TEXT,
ADD COLUMN     "pendingAction" "PendingAction";

-- AlterTable
ALTER TABLE "PostView" DROP COLUMN "ipHash",
ADD COLUMN     "dayString" TEXT NOT NULL,
ADD COLUMN     "ipUaHash" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE UNIQUE INDEX "Post_bannerImageId_key" ON "Post"("bannerImageId");

-- CreateIndex
CREATE UNIQUE INDEX "PostView_postId_dayString_ipUaHash_key" ON "PostView"("postId", "dayString", "ipUaHash");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_bannerImageId_fkey" FOREIGN KEY ("bannerImageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_originalPostId_fkey" FOREIGN KEY ("originalPostId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCategory" ADD CONSTRAINT "PostCategory_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCategory" ADD CONSTRAINT "PostCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostView" ADD CONSTRAINT "PostView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
