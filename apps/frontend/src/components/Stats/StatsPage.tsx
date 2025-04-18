import { TaskDistribution } from './TaskDistribution';
import { CommentsPerUser } from './CommentsPerUser';

export const StatsPage = () => {
  return (
    <div className="container mx-auto px-4 py-4 h-[calc(100vh-4rem)]">
      <h1 className="text-xl font-bold text-white mb-4 text-right">
        מבט על הצוות
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 h-[45vh]">
        <div className="h-full">
          <CommentsPerUser />
        </div>
        <div className="h-full">
          <TaskDistribution />
        </div>
      </div>
    </div>
  );
};
