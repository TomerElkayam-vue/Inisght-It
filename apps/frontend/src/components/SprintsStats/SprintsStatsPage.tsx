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
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';

export const SprintsStatsPage = () => {
  const { currentProject } = useCurrentProjectContext();
  const hasCredentials = !!currentProject?.codeRepositoryCredentials?.token && !!currentProject?.codeRepositoryCredentials.token;

  return (hasCredentials ? (
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
  ) : (
        <div className="flex items-center justify-center p-6 bg-gray-900 rounded-lg min-h-[80vh]">
          <p className="text-xl text-gray-400 text-center">
   על מנת להציג תובנות עליך לקשר את הפרוייקט לכלי לניהול המשימות ולכלי ניהול הקוד בעמוד ניהול הפרוייקט 
   או לבחור פרוייקט שכבר מקושר לכלים אלו
          </p>
        </div>
      )
  );
};
