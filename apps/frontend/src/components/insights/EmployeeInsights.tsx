import { useEffect, useState } from 'react';
import { getAiRecommendation } from '../../services/ai.service';
import { useUserData } from '../hooks/UseUserData';

interface EmployeeInsightsProps {
  employee: string;
}

export const EmployeeInsights = ({ employee }: EmployeeInsightsProps) => {
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
    <div className="bg-gray-900 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4 text-right">
        {employee}
      </h2>

      <div dir="rtl" className="space-y-4 text-white mb-4">
        {/* {recommendation} */}
        העובד השלים 5 User Stories וקיבל מעט הערות בסקרי הקוד. העבודה בוצעה ברמה
        טובה וההערות היו מועטות ואיכותיות. המלצות לעתיד: להמשיך לשמור על איכות
        הקוד ולהתייחס באופן יעיל להערות בסקרי קוד. לשאוף לצמצם עוד יותר את
        ההערות על ידי בדיקה עצמאית מוקדמת של הקוד לפני הגשתו. להעמיק בבדיקות
        יחידה ובאוטומציה לשיפור יציבות ואמינות הקוד.
      </div>
    </div>
  );
};
