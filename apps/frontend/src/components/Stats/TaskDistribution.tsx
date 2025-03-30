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
import { taskDistributionData } from '../../data/mockStats';

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
      text: 'כמות משימות בספרינט',
      color: 'white',
      font: {
        size: 14
      }
    },
  },
  scales: {
    x: {
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
  return (
    <div className="bg-gray-900 p-4 rounded-lg h-full">
      <div className="h-[40vh]">
        <Bar options={options} data={taskDistributionData} />
      </div>
    </div>
  );
}; 