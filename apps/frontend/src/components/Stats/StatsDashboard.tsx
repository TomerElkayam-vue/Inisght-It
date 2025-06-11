import { useEffect, useMemo, useState } from 'react';
import {
  getSprints,
  JiraDataType,
  SprintResponse,
} from '../../services/jira.service';
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
  ChartData,
  ChartDataset,
} from 'chart.js';
import {
  generateMultipleGraphDataset,
  generateSingleGraphDataset,
} from './jira/genereGraphDataset';
import { GithubDataType } from '../../services/github.service';

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

export const githubDataTypeToText: Record<string, string> = {
  [GithubDataType.PR]: 'Pull Request',
  [GithubDataType.COMMENTS]: 'Comments Review',
  [GithubDataType.COMMITS]: 'Commits',
  [GithubDataType.FILE_CHANGES]: 'File Changes',
};

export const jiraDataTypeToText: Record<string, string> = {
  [JiraDataType.ISSUES]: 'Issues',
  [JiraDataType.STORY_POINTS]: 'Story Points',
  [JiraDataType.ISSUE_STATUS]: 'Issue Status',
  [JiraDataType.ISSUE_TYPE]: 'Issue Type',
};

interface StatsDashboardProps {
  dataTypeToText: Record<string, string>;
  initialSelectedDataType: string;
  fetchData: (
    projectId: string,
    statType: string | any,
    teamStats: boolean
  ) => Promise<Record<string, Record<string, any>>>;
  isWorkerView?: boolean;
  currentWorker?: string;
}

export const StatsDashboard = ({
  dataTypeToText,
  initialSelectedDataType,
  fetchData,
  isWorkerView = false,
  currentWorker,
}: StatsDashboardProps) => {
  const [toggle, setToggle] = useState('user');
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
          toggle === 'team'
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
  }, [currentProject, selectedDataType, toggle, fetchData]);

  const isMultipleDataGraph = useMemo(() => {
    if (stats && Object.values(stats).length > 0) {
      return toggle === 'user'
        ? typeof Object.values(Object.values(stats || {})[0])[0] === 'object'
        : typeof Object.values(stats || {})[0] === 'object';
    } else {
      return false;
    }
  }, [stats, toggle]);

  const barChartData = useMemo<ChartData<'bar'>>(() => {
    let filteredStats = stats;

    if (isWorkerView && currentWorker && stats) {
      // Calculate team average
      const teamAverage = Object.entries(stats).reduce((acc, [_, data]) => {
        if (typeof data === 'object') {
          Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'number') {
              acc[key] = (acc[key] || 0) + value;
            }
          });
        }
        return acc;
      }, {} as Record<string, number>);

      // Calculate average values
      const numWorkers = Object.keys(stats).length;
      Object.keys(teamAverage).forEach((key) => {
        teamAverage[key] = teamAverage[key] / numWorkers;
      });

      // Keep only current worker and team average
      filteredStats = {
        [currentWorker]: stats[currentWorker],
        'Team Average': teamAverage,
      };
    }

    const labels =
      toggle === 'team'
        ? sprints
        : isMultipleDataGraph
        ? Object.keys(filteredStats ?? [])
        : sprints || [];

    const datasets = isMultipleDataGraph
      ? toggle === 'team'
        ? generateTeamMultipleGraphDataset(filteredStats ?? {})
        : generateMultipleGraphDataset(
            filteredStats ?? {},
            selectedSprint ?? ''
          )
      : toggle === 'team'
      ? generateTeamSingleGraphDataset(
          (filteredStats as any as Record<string, number>) ?? {}
        )
      : generateSingleGraphDataset(filteredStats ?? {});

    return {
      labels,
      datasets: datasets.map((dataset) => ({
        ...dataset,
        label: String(dataset.label),
      })),
    };
  }, [
    stats,
    sprints,
    isMultipleDataGraph,
    selectedSprint,
    toggle,
    isWorkerView,
    currentWorker,
  ]);

  const lineChartData = useMemo<ChartData<'line'>>(() => {
    let filteredStats = stats;

    if (isWorkerView && currentWorker && stats) {
      // Calculate team average
      const teamAverage = Object.entries(stats).reduce((acc, [_, data]) => {
        if (typeof data === 'object') {
          Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'number') {
              acc[key] = (acc[key] || 0) + value;
            }
          });
        }
        return acc;
      }, {} as Record<string, number>);

      // Calculate average values
      const numWorkers = Object.keys(stats).length;
      Object.keys(teamAverage).forEach((key) => {
        teamAverage[key] = teamAverage[key] / numWorkers;
      });

      // Keep only current worker and team average
      filteredStats = {
        [currentWorker]: stats[currentWorker],
        'Team Average': teamAverage,
      };
    }

    const labels =
      toggle === 'team'
        ? sprints
        : isMultipleDataGraph
        ? Object.keys(filteredStats ?? [])
        : sprints || [];

    const datasets = isMultipleDataGraph
      ? toggle === 'team'
        ? generateTeamMultipleGraphDataset(filteredStats ?? {})
        : generateMultipleGraphDataset(
            filteredStats ?? {},
            selectedSprint ?? ''
          )
      : toggle === 'team'
      ? generateTeamSingleGraphDataset(
          (filteredStats as any as Record<string, number>) ?? {}
        )
      : generateSingleGraphDataset(filteredStats ?? {});

    return {
      labels,
      datasets: datasets.map((dataset) => ({
        ...dataset,
        label: String(dataset.label),
      })),
    };
  }, [
    stats,
    sprints,
    isMultipleDataGraph,
    selectedSprint,
    toggle,
    isWorkerView,
    currentWorker,
  ]);

  const DataChart = () =>
    isMultipleDataGraph ? (
      <Bar options={generateGraphOptions('Issue Data')} data={barChartData} />
    ) : (
      <Line options={generateGraphOptions('Issue Data')} data={lineChartData} />
    );

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-gray-900 rounded-lg">
      {/* Top Buttons */}
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
      {isMultipleDataGraph && toggle !== 'team' && (
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

      {/* Toggle */}
      {!isWorkerView && (
        <div className="flex border rounded-full overflow-hidden shadow">
          <div className="inline-flex rounded-full overflow-hidden border border-[#444] bg-[#1e2235]">
            <button
              type="button"
              onClick={() => setToggle('team')}
              className={`px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                toggle === 'team'
                  ? 'bg-[#f8d94e] text-black'
                  : 'text-gray-200 hover:bg-[#2a2f4a]'
              }`}
            >
              By Team
            </button>
            <button
              type="button"
              onClick={() => setToggle('user')}
              className={`px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                toggle === 'user'
                  ? 'bg-[#f8d94e] text-black'
                  : 'text-gray-200 hover:bg-[#2a2f4a]'
              }`}
            >
              By User
            </button>
          </div>
        </div>
      )}
      {/* Dashboard Text */}
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
