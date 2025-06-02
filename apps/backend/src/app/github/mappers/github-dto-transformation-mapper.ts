import { GithubDataType } from '../enums/github-data-type.enum'

export const GithubDtoTransformationMapper: Record<GithubDataType,
  {
    sprintInitaliztionValue: any;
    dataTransformation: (currentData: any, fields: any) => any;
  }
> = {
  [GithubDataType.PR]: {
    sprintInitaliztionValue: 0,
    dataTransformation: (currentData: any, fields: any) => {
      return currentData + 1;
    },
  },
  [GithubDataType.COMMENTS]: {
    sprintInitaliztionValue: 0,
    dataTransformation: (currentData: any, fields: any) => {
      return currentData + fields.review_comments;
    },
  },
  [GithubDataType.COMMITS]: {
    sprintInitaliztionValue: 0,
    dataTransformation: (currentData: any, fields: any) => {
      return currentData + fields.commits;
    },
  },
  [GithubDataType.FILE_CHANGES]: {
    sprintInitaliztionValue: {
      additions : 0,
      deletions: 0
    },
    dataTransformation: (currentData: any, fields: any) => {
      return {
        additions : currentData.additions + fields.additions,
        deletions: currentData.deletions + fields.deletions,
      }
    },
  }
};
