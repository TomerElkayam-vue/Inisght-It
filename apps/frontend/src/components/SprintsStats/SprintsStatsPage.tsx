import {
  githubDataTypeToText,
  jiraDataTypeToText,
  StatsDashboard,
} from './StatsDashboard';
import {
  getGithubStats,
  GithubDataType,
} from '../../services/github.service';
import {
  getJiraStats,
  JiraDataType,
} from '../../services/jira.service';
import { IssueTimeline } from '../Timeline/IssueTimeline';

export const SprintsStatsPage = () => {
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
      <div className="h-full mt-4">
        <IssueTimeline />
      </div>
    </div>
  );
};
