import { useEffect, useMemo, useState } from 'react';
import { getSprints, SprintResponse } from '../../services/jira.service';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { Bar, Line } from 'react-chartjs-2';
import { generateGraphOptions } from './jira/graphOptions/generateGraphOptions';
import {
  generateTeamMultipleGraphDataset,
  generateTeamSingleGraphDataset,
} from './jira/genereGraphDataset';
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Chart as ChartJS,
  BarElement,
} from 'chart.js';
import {
  generateMultipleGraphDataset,
  generateSingleGraphDataset,
} from './jira/genereGraphDataset';

ChartJS.register(
  CategoryScale,
  BarElement,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StatsDashboardProps {
  dataTypeToText: Record<string, string>;
  initialSelectedDataType: string;
  fetchData: (
    projectId: string,
    statType: string | any,
    teamStats: boolean
  ) => Promise<Record<string, Record<string, any>>>;
  isWorkerView?: boolean;
}

export const StatsDashboard = ({
  dataTypeToText,
  initialSelectedDataType,
  fetchData,
  isWorkerView = false,
}: StatsDashboardProps) => {
  const [selectedDataType, setSelectedDataType] = useState<string>(
    initialSelectedDataType
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sprints, setSprints] = useState<SprintResponse>([]);
  const [selectedSprint, setSelectedSprint] = useState<string | null>(null);
  const [stats, setstats] = useState<Record<
    string,
    Record<string, any>
  > | null>(null);
  const { currentProject } = useCurrentProjectContext();

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentProject) return;

      try {
        setIsLoading(true);
        const statsResponse = await fetchData(
          currentProject.id,
          selectedDataType,
          false // Always fetch user stats in worker view
        );
        setstats(statsResponse);

        const sprintsResponse = await getSprints(currentProject.id);
        setSprints(sprintsResponse);

        setError(null);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error fetching issues count:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [currentProject, selectedDataType, fetchData]);

  const isMultipleDataGraph = useMemo(() => {
    if (stats && Object.values(stats).length > 0) {
      return (
        typeof Object.values(Object.values(stats || {})[0])[0] === 'object'
      );
    } else {
      return false;
    }
  }, [stats]);

  const chartData = useMemo(() => {
    return {
      labels: isMultipleDataGraph ? Object.keys(stats ?? []) : sprints || [],
      datasets: isMultipleDataGraph
        ? generateMultipleGraphDataset(stats ?? {}, selectedSprint ?? '')
        : generateSingleGraphDataset(stats ?? {}),
    };
  }, [stats, sprints, isMultipleDataGraph, selectedSprint]);

  const DataChart = () =>
    isMultipleDataGraph ? (
      <Bar options={generateGraphOptions('Issue Data')} data={chartData} />
    ) : (
      <Line options={generateGraphOptions('Issue Data')} data={chartData} />
    );

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-gray-900 rounded-lg">
      {/* Data Type Buttons */}
      <div className="flex gap-3">
        {Object.entries(dataTypeToText).map(([dataType, text]) => (
          <button
            key={dataType}
            onClick={() => setSelectedDataType(dataType)}
            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-200
              ${
                selectedDataType === dataType
                  ? 'bg-[#f8d94e] text-black shadow-md'
                  : 'bg-[#2a2f4a] text-gray-300 hover:bg-[#3a3f5c]'
              }`}
          >
            {text}
          </button>
        ))}
      </div>

      {/* Sprint Buttons */}
      {isMultipleDataGraph && (
        <div className="flex gap-3">
          {sprints.map((sprint) => (
            <button
              key={sprint}
              onClick={() => setSelectedSprint(sprint)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-200
                ${
                  selectedSprint === sprint
                    ? 'bg-[#f8d94e] text-black shadow-md'
                    : 'bg-[#2a2f4a] text-gray-300 hover:bg-[#3a3f5c]'
                }`}
            >
              {sprint}
            </button>
          ))}
        </div>
      )}

      {/* Dashboard Chart */}
      <div className="flex-1 min-h-[20rem] w-full bg-gray-900 p-4 rounded flex items-center justify-center relative">
        {isLoading ? (
          <div className="absolute inset-0 bg-[#151921] bg-opacity-90 flex items-center justify-center z-0">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white text-lg">טוען מידע...</span>
            </div>
          </div>
        ) : (
          <DataChart />
        )}
      </div>
    </div>
  );
};
