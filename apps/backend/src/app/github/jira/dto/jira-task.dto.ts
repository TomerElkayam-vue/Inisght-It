import { JiraSprintDto } from './jira-sprint.dto';
import { JiraUserDto } from './jira-user.dto';

export type JiraTaskDto = {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields: {
    sprint: JiraSprintDto;
    assignee: JiraUserDto;
  };
};
