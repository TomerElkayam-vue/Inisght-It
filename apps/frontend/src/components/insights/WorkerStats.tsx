import { useEffect, useState } from 'react';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { StatsDashboard } from '../Stats/StatsDashboard';
import { getGithubStats, GithubDataType } from '../../services/github.service';
import { getJiraStats, JiraDataType } from '../../services/jira.service';
import { api } from '../../services/api.config';

interface WorkerStatsProps {
  employee: string;
}

interface WorkerInsights {
  metrics: {
    pullRequests: number;
    codeReviews: number;
    averageCommentsPerPR: number;
    issuesCompleted: number;
    averageIssueTime: number;
    totalStoryPoints: number;
  };
  summary: string;
  recommendations: string[];
}

export const WorkerStats = ({ employee }: WorkerStatsProps) => {
  const { currentProject } = useCurrentProjectContext();
  const [insights, setInsights] = useState<WorkerInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const githubDataTypeToText: Record<string, string> = {
    [GithubDataType.PR]: 'Pull Requests',
    [GithubDataType.COMMENTS]: 'Code Reviews',
    [GithubDataType.COMMITS]: 'Commits',
    [GithubDataType.FILE_CHANGES]: 'File Changes',
  };

  const jiraDataTypeToText: Record<string, string> = {
    [JiraDataType.ISSUES]: 'Tasks',
    [JiraDataType.STORY_POINTS]: 'Story Points',
    [JiraDataType.ISSUE_STATUS]: 'Task Status',
    [JiraDataType.ISSUE_TYPE]: 'Task Types',
  };

  useEffect(() => {
    const fetchInsights = async () => {
      if (!currentProject) return;

      try {
        setIsLoading(true);
        const response = await api.get<WorkerInsights>(
          `/ai/worker-insights/${currentProject.id}/${employee}`
        );
        setInsights(response.data);
      } catch (error) {
        console.error('Error fetching worker insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [currentProject, employee]);

  return (
    <div className="space-y-6">
      {/* GitHub and Jira Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsDashboard
          dataTypeToText={githubDataTypeToText}
          initialSelectedDataType={GithubDataType.PR}
          fetchData={getGithubStats}
          isWorkerView={true}
        />
        <StatsDashboard
          dataTypeToText={jiraDataTypeToText}
          initialSelectedDataType={JiraDataType.ISSUES}
          fetchData={getJiraStats}
          isWorkerView={true}
        />
      </div>

      {/* Worker Performance Summary */}
      <div className="bg-[#2a2f4a] p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4 text-right">
          סיכום ביצועי העובד
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#f8d94e] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <p className="text-gray-300 leading-relaxed">{insights?.summary}</p>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-[#2a2f4a] p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4 text-right">
          המלצות לשיפור
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#f8d94e] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ul className="space-y-3">
            {insights?.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-300">
                <span className="text-[#f8d94e] mt-1">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
