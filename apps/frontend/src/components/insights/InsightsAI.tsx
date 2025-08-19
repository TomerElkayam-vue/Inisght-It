import { useEffect, useState } from 'react';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import {
  getWorkerInsights,
  getTeamInsights,
  InsightsResponse,
} from '../../services/ai.service';
import { PromptProps } from './Prompt';

export const InsightsAI = ({ target, type }: PromptProps) => {
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

        const sanitizedResponse: InsightsResponse = {
          summary: response.summary?.trim()
            ? response.summary
            : 'אין ודאות לגבי התשובה',
          recommendations: response.recommendations?.trim()
            ? response.recommendations
            : 'אין ודאות לגבי התשובה',
        };

        setInsights(sanitizedResponse);
      } catch (error) {
        console.error('Error fetching insights:', error);
        setInsights({
          summary: 'נראה כי התרחשה שגיאה',
          recommendations: 'נראה כי התרחשה שגיאה',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInsights();
  }, [currentProject, target, type]);

  // Function to render text with **bold** and \n for new lines
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <p key={i} className="text-gray-300 leading-relaxed text-right" dir="rtl">
        {line
          .split(/\*\*(.*?)\*\*/g)
          .map((part, index) =>
            index % 2 === 1 ? <strong key={index}>{part}</strong> : part
          )}
      </p>
    ));
  };

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
          <>{insights?.summary && renderFormattedText(insights.summary)}</>
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
          <>
            {insights?.recommendations &&
              renderFormattedText(insights.recommendations)}
          </>
        )}
      </div>
    </div>
  );
};
