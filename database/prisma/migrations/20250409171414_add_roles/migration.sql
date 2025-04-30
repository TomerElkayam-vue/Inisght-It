-- CreateTable
CREATE TABLE "roles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- Insert default roles
INSERT INTO "roles" (name) VALUES 
  (1, 'OWNER'),
  (2, 'MEMBER'),
