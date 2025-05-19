-- CreateTable
CREATE TABLE "employee" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "display_name" TEXT NOT NULL,
    "github_username" TEXT,
    "jira_username" TEXT,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_employee" (
    "project_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,

    CONSTRAINT "project_employee_pkey" PRIMARY KEY ("employee_id","project_id")
);

-- AddForeignKey
ALTER TABLE "project_employee" ADD CONSTRAINT "project_employee_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_employee" ADD CONSTRAINT "project_employee_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
