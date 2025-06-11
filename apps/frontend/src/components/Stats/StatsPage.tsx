import { CircularProgress } from './CircularProgress';
import {
  githubDataTypeToText,
  jiraDataTypeToText,
  StatsDashboard,
} from './StatsDashboard';

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

export const TeamStatsPage = () => {
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
