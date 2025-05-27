import { Sprint } from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';
import {
  getJiraStats,
  getSprints,
  SprintResponse,
} from '../../services/jira.service';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import randomColor from 'randomcolor';
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

export enum JiraDataType {
  ISSUES = 'ISSUES',
  STORY_POINTS = 'STORY_POINTS',
  ISSUE_STATUS = 'ISSUE_STATUS',
  ISSUE_TYPE = 'ISSUE_TYPE',
}

const dataTypeToText: Record<JiraDataType, string> = {
  [JiraDataType.ISSUES]: 'Issues',
  [JiraDataType.STORY_POINTS]: 'Story Points',
  [JiraDataType.ISSUE_STATUS]: 'Issue Status',
  [JiraDataType.ISSUE_TYPE]: 'Issue Type',
};

export const JiraDashboard = () => {
  const [toggle, setToggle] = useState('user');
  const [selectedDataType, setSelectedDataType] = useState<JiraDataType>(
    JiraDataType.ISSUES
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
    const fetchData = async () => {
      if (!currentProject) return;

      try {
        setIsLoading(true);
        const statsResponse = await getJiraStats(
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

    fetchData();
  }, [currentProject, selectedDataType, toggle]);

  const isMultipleDataGraph = useMemo(() => {
    if (stats && Object.values(stats).length > 0) {
      return toggle === 'user'
        ? typeof Object.values(Object.values(stats || {})[0])[0] === 'object'
        : typeof Object.values(stats || {})[0] === 'object';
    } else {
      return false;
    }
  }, [stats, toggle]);

  const chartData = useMemo(() => {
    return {
      labels:
        toggle === 'team'
          ? sprints
          : isMultipleDataGraph
          ? Object.keys(stats ?? [])
          : sprints || [],
      datasets: isMultipleDataGraph
        ? toggle === 'team'
          ? generateTeamMultipleGraphDataset(stats ?? {})
          : generateMultipleGraphDataset(stats ?? {}, selectedSprint ?? '')
        : toggle === 'team'
        ? generateTeamSingleGraphDataset(
            (stats as any as Record<string, number>) ?? {}
          )
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
      {/* Top Buttons */}
      <div className="flex gap-3">
        {Object.entries(dataTypeToText).map(([dataType, text]) => (
          <button
            key={dataType}
            onClick={() => setSelectedDataType(dataType as JiraDataType)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200
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
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200
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
      <div className="flex border rounded-full overflow-hidden shadow">
        <div className="inline-flex rounded-full overflow-hidden border border-[#444] bg-[#1e2235]">
          <button
            type="button"
            onClick={() => setToggle('team')}
            className={`px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
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
            className={`px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
              toggle === 'user'
                ? 'bg-[#f8d94e] text-black'
                : 'text-gray-200 hover:bg-[#2a2f4a]'
            }`}
          >
            By User
          </button>
        </div>
      </div>
      {/* Dashboard Text */}
      <div className="h-96 w-full bg-gray-900 p-4 rounded flex items-center justify-center relative">
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
