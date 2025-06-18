import { useEffect, useState } from 'react';
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
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { getGithubServerClientDistribution } from '../../services/github.service';
import { generateGraphOptions } from '../SprintsStats/configs/generateGraphOptions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const ServerClientDistribution = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Record<string, { server: number; client: number }> | null>(null);
  const { currentProject } = useCurrentProjectContext();

  useEffect(() => {
    const fetchData = async () => {
      if (!currentProject) return;

      try {
        setIsLoading(true);
        const response = await getGithubServerClientDistribution(currentProject.id);
        setData(response as Record<string, { server: number; client: number }>);
      } catch (error) {
        console.error('Error fetching server/client distribution:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentProject]);

  const chartData = {
    labels: data ? Object.keys(data) : [],
    datasets: [
      {
        label: 'Server',
        data: data ? Object.values(data).map(d => d.server) : [],
        backgroundColor: '#8b5cf6',
      },
      {
        label: 'Client',
        data: data ? Object.values(data).map(d => d.client) : [],
        backgroundColor: '#f8d94e',
      },
    ],
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 bg-gray-900 rounded-lg h-full">
      <h2 className="text-xl font-bold text-white">Server Client Distribution</h2>
      <div className="w-full flex-1 bg-gray-900 p-4 flex items-center justify-center relative">
        {isLoading ? (
          <div className="absolute inset-0 bg-[#151921] bg-opacity-90 flex items-center justify-center z-0">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white text-lg">טוען מידע...</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full">
            <Bar options={generateGraphOptions('work distribution of each employee in the server and client throughout the project')} data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
}; 