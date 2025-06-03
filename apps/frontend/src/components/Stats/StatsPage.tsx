import { CommentsPerUser } from './CommentsPerUser';
import { CircularProgress } from './CircularProgress';
import { circularStats } from '../../data/mockStats';
import { JiraDashboard } from './JiraDashboard';

export const StatsPage = () => {
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="grid grid-cols-1 gap-4  h-[85vh]">
        <div className="h-full">
          <JiraDashboard />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 mb-4 h-[55vh]">
        <div className="h-full">
          <CommentsPerUser />
        </div>
      </div>
    </div>
  );
};
