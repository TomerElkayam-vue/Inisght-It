-- Create two template projects
INSERT INTO "projects" ("id", "name", "createdAt")
VALUES 
  ('381be2c1-012f-44c7-818a-6d78f4ad2067', 'Template Project 1', NOW()),
  ('3bf9372d-24a6-480a-bb26-863ec8112429', 'Template Project 2', NOW());

-- Add some template employees to the projects
-- INSERT INTO "project_employee" ("project_id", "employee_id")
-- VALUES 
--   ('381be2c1-012f-44c7-818a-6d78f4ad2067', '11111111-1111-1111-1111-111111111111'),
--   ('381be2c1-012f-44c7-818a-6d78f4ad2067', '22222222-2222-2222-2222-222222222222'),
--   ('381be2c1-012f-44c7-818a-6d78f4ad2067', '11111111-1111-1111-1111-111111111111'),
--   ('381be2c1-012f-44c7-818a-6d78f4ad2067', '22222222-2222-2222-2222-222222222222'); 