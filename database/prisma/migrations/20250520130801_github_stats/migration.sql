-- CreateTable
CREATE TABLE "sprints" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "project_id" UUID NOT NULL,

    CONSTRAINT "sprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sprintId" INTEGER NOT NULL,
    "employee_id" UUID NOT NULL,
    "total_review_comments" INTEGER NOT NULL,
    "total_pr_time" INTEGER NOT NULL,
    "average_comments_per_pr" DOUBLE PRECISION NOT NULL,
    "average_pr_time" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pull_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pr_number" INTEGER NOT NULL,
    "pr_title" TEXT NOT NULL,
    "review_comments" INTEGER NOT NULL,
    "user_stats_id" UUID NOT NULL,

    CONSTRAINT "pull_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_sprintId_employee_id_key" ON "user_stats"("sprintId", "employee_id");

-- AddForeignKey
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "sprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_user_stats_id_fkey" FOREIGN KEY ("user_stats_id") REFERENCES "user_stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
