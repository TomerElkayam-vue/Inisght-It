import { useEffect, useState } from 'react';
import randomColor from 'randomcolor';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getPullRequestsSummery } from '../../services/github.service';
import { SprintCommentsPerUser } from '@packages/github';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      labels: {
        color: 'white',
      },
    },
    title: {
      display: true,
      text: 'ממוצע הערות לכל משתמש לפי ספרינט',
      color: 'white',
      font: {
        size: 14,
      },
    },
  },
  scales: {
    y: {
      type: 'linear' as const,
      position: 'left' as const,
      ticks: {
        color: 'white',
      },
    },
    x: {
      ticks: {
        color: 'white',
      },
    },
  },
};

export const CommentsPerUser = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SprintCommentsPerUser[] | null>(null);
  const { currentProject } = useCurrentProjectContext();

  useEffect(() => {
    const fetchData = async () => {
      if (!currentProject) return;

      try {
        const response = await getPullRequestsSummery(currentProject.id);
        setData(response);
        setError(null);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error fetching pull request summary:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentProject]);

  // Get all unique usernames
  const allUsers = Array.from(
    new Set(
      data?.flatMap((sprint) => sprint.userStats.map((u) => u.login)) || []
    )
  );

  const chartData = {
    labels: data?.map((sprint) => sprint.sprintName) || [],
    datasets:
      allUsers.map((username) => {
        const color = randomColor();
        return {
          label: username,
          data: data?.map((sprint) => {
            const user = sprint.userStats.find((u) => u.login === username);
            return user?.averageCommentsPerPR ?? 0;
          }),
          backgroundColor: color,
          borderColor: color,
          tension: 0.3,
        };
      }) || [],
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
    <div className="h-96 w-full bg-gray-900 p-4 rounded flex items-center justify-center">
      <Line options={options} data={chartData} />
    </div>
  );
};
