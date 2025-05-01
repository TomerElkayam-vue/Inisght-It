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
  Legend
} from 'chart.js';
import { getIssuesCount, getSprints, IssuesCountResponse } from '../../services/jira.service';

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
        color: 'white'
      }
    },
    title: {
      display: true,
      text: 'כמות משימות לפי ספרינט',
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
      }
    },
  },
};

export const TaskDistribution = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setstats] = useState<IssuesCountResponse | null>(null);
  const [sprints, setSprints] = useState<string[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsResponse = await getIssuesCount();
        setstats(statsResponse);

        const sprintsResponse = await getSprints();
        setSprints(sprintsResponse);
        
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

  const chartData = {
    labels: sprints || [],
    datasets: stats?.map(userstat => {
      const color = randomColor();

      return {
        label: userstat.name,
        data: userstat?.stats ? Object.values(userstat.stats) : [],
        backgroundColor: color,
        borderColor: color,
      };
    }) || []
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
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};