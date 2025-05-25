import { JiraDataType } from '../enums/jira-data-type.enum';

export const JiraDtoTransformationMapper: Record<
  JiraDataType,
  {
    sprintInitaliztionValue: any;
    dataTransformation: (currentData: any, fields: any) => any;
  }
> = {
  [JiraDataType.ISSUES]: {
    sprintInitaliztionValue: 0,
    dataTransformation: (currentData: any, fields: any) => {
      return currentData + 1;
    },
  },
  [JiraDataType.STORY_POINTS]: {
    sprintInitaliztionValue: 0,
    dataTransformation: (currentData: any, fields: any) => {
      return currentData + fields.storyPoints;
    },
  },
  [JiraDataType.ISSUE_STATUS]: {
    sprintInitaliztionValue: {},
    dataTransformation: (currentData: any, fields: any) => {
      return {
        ...currentData,
        [fields.statusCategory]: (currentData[fields.statusCategory] ?? 0) + 1,
      };
    },
  },
  [JiraDataType.ISSUE_TYPE]: {
    sprintInitaliztionValue: {},
    dataTransformation: (currentData: any, fields: any) => {
      return {
        ...currentData,
        [fields.issueType]: (currentData[fields.issueType] ?? 0) + 1,
      };
    },
  },
};
