import { SprintProgress } from './SprintProgress';
import { TaskDistribution } from './TaskDistribution';
import { CircularProgress } from './CircularProgress';
import { circularStats } from '../../data/mockStats';

export const StatsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6 text-right">מבט על הצוות</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <SprintProgress />
        <TaskDistribution />
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