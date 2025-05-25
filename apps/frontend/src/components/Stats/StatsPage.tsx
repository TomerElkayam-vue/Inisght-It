import { CommentsPerUser } from './CommentsPerUser';
import { CircularProgress } from './CircularProgress';
import { circularStats } from '../../data/mockStats';
import { JiraDashboard } from './JiraDashboard';

export const StatsPage = () => {
  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className="text-xl font-bold text-white mb-4 text-right">
        מבט על הצוות
      </h1>
      <div className="grid grid-cols-1 gap-4 mb-10 h-[85vh]">
        <div className="h-full">
          <JiraDashboard />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 mb-4 h-[45vh]">
        <div className="h-full">
          <CommentsPerUser />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CircularProgress
          value={circularStats.backlogTasks.value}
          total={circularStats.backlogTasks.total}
          label={circularStats.backlogTasks.label}
        />
        <CircularProgress
          value={circularStats.averageTaskTime.value}
          total={circularStats.averageTaskTime.total}
          label={circularStats.averageTaskTime.label}
        />
        <CircularProgress
          value={circularStats.averageSprintTime.value}
          total={circularStats.averageSprintTime.total}
          label={circularStats.averageSprintTime.label}
        />
      </div>
    </div>
  );
};
