/*
  Warnings:

  - Added the required column `roleId` to the `project_permissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "project_permissions" ADD COLUMN     "roleId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "roles" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- Insert default roles
INSERT INTO "roles" (id, name) VALUES 
  (1, 'OWNER'),
  (2, 'MEMBER');

-- AddForeignKey
ALTER TABLE "project_permissions" ADD CONSTRAINT "project_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
