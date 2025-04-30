
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CircularProgressProps {
  value: number;
  total: number;
  label: string;
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

export const CircularProgress = ({ value, total, label }: CircularProgressProps) => {
  const data = {
    datasets: [
      {
        data: [value, total - value],
        backgroundColor: [
          '#8b5cf6',
          '#1f2937',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg h-full">
      <div className="relative h-full flex items-center justify-center">
        <div className="w-32 h-32">
          <Doughnut options={options} data={data} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-2xl font-bold text-white">{value}</span>
          <span className="text-xs text-gray-400 text-center mt-1 max-w-[80px]">{label}</span>
        </div>
      </div>
    </div>
  );
}; 