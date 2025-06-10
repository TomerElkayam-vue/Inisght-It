import { CircularProgress } from './CircularProgress';
import { StatsDashboard } from './StatsDashboard';
import {
  getGithubAvgStats,
  getGithubStats,
  GithubAvgDataType,
  GithubDataType,
} from '../../services/github.service';
import {
  getJiraAvgStats,
  getJiraStats,
  JiraAvgDataType,
  JiraDataType,
} from '../../services/jira.service';
import { IssueTimeline } from '../Timeline/IssueTimeline';

export const StatsPage = () => {
  const githubDataTypeToText: Record<string, string> = {
    [GithubDataType.PR]: 'Pull Request',
    [GithubDataType.COMMENTS]: 'Comments Review',
    [GithubDataType.COMMITS]: 'Commits',
    [GithubDataType.FILE_CHANGES]: 'File Changes',
  };

  const jiraDataTypeToText: Record<string, string> = {
    [JiraDataType.ISSUES]: 'Issues',
    [JiraDataType.STORY_POINTS]: 'Story Points',
    [JiraDataType.ISSUE_STATUS]: 'Issue Status',
    [JiraDataType.ISSUE_TYPE]: 'Issue Type',
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-full">
          <StatsDashboard
            dataTypeToText={jiraDataTypeToText}
            initialSelectedDataType={JiraDataType.ISSUES}
            fetchData={getJiraStats}
          />
        </div>
        <div className="h-full">
          <StatsDashboard
            dataTypeToText={githubDataTypeToText}
            initialSelectedDataType={GithubDataType.PR}
            fetchData={getGithubStats}
          />
        </div>
      </div>
      <div className="h-full">
        <IssueTimeline />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
        <CircularProgress<JiraAvgDataType>
          fetchData={getJiraAvgStats}
          statsType={JiraAvgDataType.ISSUES}
          label="Issue"
        />
        <CircularProgress<JiraAvgDataType>
          fetchData={getJiraAvgStats}
          statsType={JiraAvgDataType.STORY_POINTS}
          label="Story Points"
        />
        <CircularProgress<GithubAvgDataType>
          fetchData={getGithubAvgStats}
          statsType={GithubAvgDataType.PR}
          label="PR"
        />
        <CircularProgress<GithubAvgDataType>
          fetchData={getGithubAvgStats}
          statsType={GithubAvgDataType.COMMITS}
          label="Commits"
        />
      </div>
    </div>
  );
};
