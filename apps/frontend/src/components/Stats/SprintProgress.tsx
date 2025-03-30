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
import { sprintProgressData } from '../../data/mockStats';

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
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: 'white',
        font: {
          size: 12
        }
      }
    },
    title: {
      display: true,
      text: 'כמות הערות בספרינט',
      color: 'white',
      font: {
        size: 14
      }
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 24,
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
    x: {
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

export const SprintProgress = () => {
  return (
    <div className="bg-gray-900 p-4 rounded-lg h-full">
      <div className="h-[40vh]">
        <Line options={options} data={sprintProgressData} />
      </div>
    </div>
  );
}; 