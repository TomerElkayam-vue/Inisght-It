import { JiraUserDto } from './jira-user.dto';

export interface JiraTaskDto {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields: {
    assignee: JiraUserDto;
  };
}
