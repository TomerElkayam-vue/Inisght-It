import { CircularProgress } from './CircularProgress';
import { ServerClientDistribution } from './ServerClientDistribution';
import {
  getGithubAvgStats,
  GithubAvgDataType,
} from '../../services/github.service';
import { getJiraAvgStats, JiraAvgDataType } from '../../services/jira.service';
import { CodeBlindSpots } from './CodeBlindSpots';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';

export const ProjectsStatsPage = () => {
  const { currentProject } = useCurrentProjectContext();
  const hasCredentials = !!currentProject?.codeRepositoryCredentials?.token && !!currentProject?.codeRepositoryCredentials.token;

  return (hasCredentials ? (
    <div className="container mx-auto px-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 h-[50vh]">
        <div className="h-full">
          <ServerClientDistribution />
        </div>
        <div className="h-full overflow-y-auto custom-scrollbar">
          <CodeBlindSpots />
        </div>
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
