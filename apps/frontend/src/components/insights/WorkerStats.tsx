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
  const [isHebrew, setIsHebrew] = useState(true);
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

  const handleLanguageToggle = async () => {
    if (!currentProject || !insights) return;

    try {
      setIsLoading(true);
      const response = await api.get<WorkerInsights>(
        `/ai/worker-insights/${
          currentProject.id
        }/${employee}?isHebrew=${!isHebrew}`
      );
      setInsights(response.data);
      setIsHebrew(!isHebrew);
    } catch (error) {
      console.error('Error toggling language:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Scroll Indicator */}
      <div className="flex flex-col items-center gap-2 text-[#f8d94e] animate-bounce">
        <span className="text-lg">גלול למטה לתובנות</span>
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>

      {/* Worker Performance Summary */}
      <div className="bg-[#2a2f4a] p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handleLanguageToggle}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 bg-[#f8d94e] text-black hover:bg-[#e6c73d]"
          >
            {isHebrew ? 'Switch to English' : 'עבור לעברית'}
          </button>
          <h2 className="text-xl font-bold text-white text-right">
            סיכום ביצועי העובד
          </h2>
        </div>
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
