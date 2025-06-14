import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { AvgStats } from '@packages/projects';
import { JiraAvgDataType } from '../../services/jira.service';
import { GithubAvgDataType } from '../../services/github.service';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CircularProgressProps<T> {
  label: string;
  statsType: T;
  fetchData: (projectId: string, statsType: T) => Promise<AvgStats>;
}

const options = {
  cutout: '75%',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
};

export const CircularProgress = <
  T extends JiraAvgDataType | GithubAvgDataType
>({
  fetchData,
  statsType,
  label,
}: CircularProgressProps<T>) => {
  const { currentProject } = useCurrentProjectContext();
  const [total, setTotal] = useState<number>(0);
  const [value, setValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      if (currentProject?.id) {
        setIsLoading(true);
        const data = await fetchData(currentProject?.id ?? '', statsType);
        setTotal(data.max);
        setValue(data.avg);
        setIsLoading(false);
      }
    };

    getData();
  }, [currentProject]);

  const data = {
    datasets: [
      {
        data: [value, Math.max(total - value, 0.1)],
        backgroundColor: ['#8b5cf6', '#1f2937'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg h-full">
      <div className="relative h-full flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center w-32 h-32">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-white text-sm">טוען נתונים...</span>
          </div>
        ) : (
          <>
            {value && (
              <>
                <div className="w-55 h-55">
                  <Doughnut options={options} data={data} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold text-white">
                    {Number.isInteger(value) ? value : value.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-400 text-center max-w-[80px]">
                    {label}
                  </span>
                  <span className="text-[0.6rem] text-gray-400 text-center max-w-[80px]">
                    avg compare to team record
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
