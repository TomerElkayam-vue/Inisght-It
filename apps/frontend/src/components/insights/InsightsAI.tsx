import { useEffect, useState } from 'react';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import {
  getWorkerInsights,
  getTeamInsights,
  InsightsResponse,
} from '../../services/ai.service';

interface InsightsAIProps {
  // userId for worker insights, projectId for team insights
  target: string; 
  type: 'worker' | 'team';
}

export const InsightsAI = ({ target, type }: InsightsAIProps) => {
  const { currentProject } = useCurrentProjectContext();
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!currentProject) return;

      try {
        setIsLoading(true);
        const response =
          type === 'worker'
            ? await getWorkerInsights(currentProject.id, target)
            : await getTeamInsights(currentProject.id);

        setInsights(response);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [currentProject, target, type]);

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="bg-[#2a2f4a] p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4 text-right">
          {type === 'worker' ? 'סיכום ביצועי העובד' : 'סיכום ביצועי הצוות'}
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#f8d94e] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <p className="text-gray-300 leading-relaxed text-right" dir="rtl">
            {insights?.summary}
          </p>
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
            {insights?.recommendations.map(
              (recommendation: string, index: number) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-300"
                >
                  <span className="text-[#f8d94e] mt-1">•</span>
                  <span className="text-right" dir="rtl">
                    {recommendation}
                  </span>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
};
