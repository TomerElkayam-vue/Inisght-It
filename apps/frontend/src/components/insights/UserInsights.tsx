import { useEffect, useState } from 'react';
import { getAiRecommendation } from '../../services/ai.service';
import { useUserData } from '../hooks/UseUserData';

export const UserInsights = () => {
  const { userData } = useUserData();
  const [recommendation, setRecommendation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (
          userData.amountOfPR &&
          userData.averageCommentsPerPR &&
          userData.issuesCount &&
          recommendation === ''
        ) {
          setIsLoading(true);
          const recommendation = await getAiRecommendation({
            amountOfCommentsPerReview: userData.averageCommentsPerPR || 0,
            amountOfUserStories: userData.issuesCount,
            numberOfReviews: userData.amountOfPR || 0,
          });
          setRecommendation(recommendation);
        }
      } catch (err) {
        console.error('Error fetching issues count:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userData]);

  return isLoading ? (
    <div className="bg-gray-900 p-4 rounded-lg h-full flex items-center justify-center">
      <div className="text-white">טוען נתונים...</div>
    </div>
  ) : (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6 text-right">
        תובנות אישיות
      </h1>

      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 text-right">
          תומר אלקיים
        </h2>

        <div dir="rtl" className="space-y-4 text-white mb-4">
          {recommendation}
        </div>
      </div>
    </div>
  );
};
