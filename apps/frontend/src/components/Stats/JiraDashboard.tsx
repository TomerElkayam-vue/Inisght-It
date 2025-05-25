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

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-gray-900 rounded-lg">
      {/* Top Buttons */}
      <div className="flex gap-2">
        {Object.entries(dataTypeToText).map(([dataType, text]) => (
          <button
            key={dataType}
            onClick={() => setSelectedDataType(dataType as JiraDataType)}
            className={`px-3 py-1 text-sm rounded-lg shadow hover:bg-blue-600 ${
              selectedDataType === dataType
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            {text}
          </button>
        ))}
      </div>

      {/* Sprint Buttons */}
      {isMultipleDataGraph && toggle !== 'team' && (
        <div className="flex gap-2">
          {sprints.map((sprint) => (
            <button
              key={sprint}
              onClick={() => setSelectedSprint(sprint)}
              className={`px-3 py-1 text-sm rounded-lg shadow hover:bg-blue-600 ${
                selectedSprint === sprint
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              {sprint}
            </button>
          ))}
        </div>
      )}

      {/* Toggle */}
      <div className="flex border rounded-full overflow-hidden shadow">
        <button
          onClick={() => setToggle('team')}
          className={`px-3 py-1 text-sm font-medium ${
            toggle === 'team'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700'
          }`}
        >
          By Team
        </button>
        <button
          onClick={() => setToggle('user')}
          className={`px-3 py-1 text-sm font-medium ${
            toggle === 'user'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700'
          }`}
        >
          By User
        </button>
      </div>
      {/* Dashboard Text */}
      <div className="h-96 w-full bg-gray-900 p-4 rounded flex items-center justify-center">
        {isMultipleDataGraph ? (
          <Bar options={generateGraphOptions('Issue Data')} data={chartData} />
        ) : (
          <Line options={generateGraphOptions('Issue Data')} data={chartData} />
        )}
      </div>
    </div>
  );
};
