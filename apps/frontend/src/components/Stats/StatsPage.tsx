import { CircularProgress } from './CircularProgress';
import { circularStats } from '../../data/mockStats';
import { StatsDashboard } from './StatsDashboard';
import { getGithubStats, GithubDataType } from '../../services/github.service';
import { getJiraStats, JiraDataType } from '../../services/jira.service';

export const TeamStatsPage = () => {
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
            isWorkerView={false}
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
    </div>
  );
};
