import { JiraDataType } from '../enums/jira-data-type.enum';

export const jiraDataTypeTransformation: Record<
  JiraDataType,
  { fields: string; transformFunction: (fields: any) => any }
> = {
  [JiraDataType.ISSUES]: {
    fields: 'assignee,sprint',
    transformFunction: (fields: any) => {
      return {
        assignee: fields.assignee,
        sprint: fields.sprint,
        id: fields.id,
      };
    },
  },
  [JiraDataType.STORY_POINTS]: {
    fields: 'assignee,sprint,customfield_10016',
    transformFunction: (fields: any) => {
      return {
        assignee: fields.assignee,
        sprint: fields.sprint,
        storyPoints: fields.customfield_10016,
      };
    },
  },
  [JiraDataType.ISSUE_STATUS]: {
    fields: 'assignee,sprint,status',
    transformFunction: (fields: any) => {
      return {
        assignee: fields.assignee,
        sprint: fields.sprint,
        statusCategory: fields.status.statusCategory.name,
      };
    },
  },
  [JiraDataType.ISSUE_TYPE]: {
    fields: 'assignee,sprint,issuetype',
    transformFunction: (fields: any) => {
      return {
        assignee: fields.assignee,
        sprint: fields.sprint,
        issueType: fields.issuetype.name,
      };
    },
  },
};
