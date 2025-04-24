import { useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getPullRequestsSummery } from '../../services/github.service';
import { UserActivity } from '../../types/github-activity';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  indexAxis: 'x' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'ממוצע הערות בסקר קוד',
      color: 'white',
      font: {
        size: 14,
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: 'white',
        font: {
          size: 12,
        },
      },
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: 'white',
        font: {
          size: 12,
        },
      },
    },
  },
};

export const CommentsPerUser = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserActivity[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getPullRequestsSummery();
        setData(response);
        setError(null);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error fetching issues count:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const averageCommentsPerUser = useMemo(() => {
    return (
      data?.reduce((acc, user) => {
        acc[user.login] = user.averageCommentsPerPR;
        return acc;
      }, {} as Record<string, number>) || {}
    );
  }, [data]);

  const chartData = {
    labels: data ? Object.keys(averageCommentsPerUser) : [],
    datasets: [
      {
        data: data ? Object.values(averageCommentsPerUser) : [],
        backgroundColor: '#8b5cf6',
        borderRadius: 6,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg h-full flex items-center justify-center">
        <div className="text-white">טוען נתונים...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg h-full flex items-center justify-center">
        <div className="text-red-500">שגיאה בטעינת הנתונים</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg h-full">
      <div className="h-[calc(100%-2rem)]">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
};
