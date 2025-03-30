import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { getIssuesCount, IssuesCountResponse } from '../../services/jira.service';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'כמות משימות לפי עובד',
      color: 'white',
      font: {
        size: 14
      }
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'white',
        font: {
          size: 12
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'white',
        font: {
          size: 12
        }
      }
    }
  },
};

export const TaskDistribution = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IssuesCountResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getIssuesCount();
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

  const chartData = {
    labels: data ? Object.keys(data) : [],
    datasets: [
      {
        data: data ? Object.values(data) : [],
        backgroundColor: '#8b5cf6',
        borderRadius: 6,
      }
    ]
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