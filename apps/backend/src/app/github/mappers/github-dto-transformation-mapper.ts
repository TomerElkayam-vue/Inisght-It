import { GithubDataType } from "../enums/github-data-type";

export const GithubDtoTransformationMapper: Record<
  GithubDataType,
  {
    sprintInitaliztionValue: any;
    dataTransformation: (currentData: any, fields: any) => any;
  }
> = {
  [GithubDataType.PR]: {
    sprintInitaliztionValue: 0,
    dataTransformation: (currentData: any, fields: any) => currentData + 1,
  },
  [GithubDataType.COMMENTS]: {
    sprintInitaliztionValue: 0,
    dataTransformation: (currentData: any, fields: any) =>
      currentData + fields.review_comments,
  },
  [GithubDataType.COMMITS]: {
    sprintInitaliztionValue: 0,
    dataTransformation: (currentData: any, fields: any) =>
      currentData + fields.commits,
  },
  [GithubDataType.FILE_CHANGES]: {
    sprintInitaliztionValue: {
      additions: 0,
      deletions: 0,
    },
    dataTransformation: (currentData: any, fields: any) => ({
      additions: currentData.additions + fields.additions,
      deletions: currentData.deletions + fields.deletions,
    }),
  },
};
