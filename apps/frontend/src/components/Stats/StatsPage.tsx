import { SprintProgress } from './SprintProgress';
import { TaskDistribution } from './TaskDistribution';
import { CircularProgress } from './CircularProgress';
import { circularStats } from '../../data/mockStats';

export const StatsPage = () => {
  return (
    <div className="container mx-auto px-4 py-4 h-[calc(100vh-4rem)]">
      <h1 className="text-xl font-bold text-white mb-4 text-right">מבט על הצוות</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 h-[45vh]">
        <div className="h-full">
          <SprintProgress />
        </div>
        <div className="h-full">
          <TaskDistribution />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[25vh]">
        <div className="h-full">
          <CircularProgress 
            value={circularStats.backlogTasks.value}
            total={circularStats.backlogTasks.total}
            label={circularStats.backlogTasks.label}
          />
        </div>
        <div className="h-full">
          <CircularProgress 
            value={circularStats.averageTaskTime.value}
            total={circularStats.averageTaskTime.total}
            label={circularStats.averageTaskTime.label}
          />
        </div>
        <div className="h-full">
          <CircularProgress 
            value={circularStats.averageSprintTime.value}
            total={circularStats.averageSprintTime.total}
            label={circularStats.averageSprintTime.label}
          />
        </div>
      </div>
    </div>
  );
}; 