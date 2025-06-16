import { useEffect, useState } from 'react';
import {
  User,
  Folder,
  Code,
  Database,
  Package,
  Search,
  Filter,
} from 'lucide-react';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { getGithubBlindSpotsInCode } from '../../services/github.service';

export const CodeBlindSpots = () => {
  const [expertise, setExpertise] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { currentProject } = useCurrentProjectContext();
  // Sample data - replace with your actual data

  useEffect(() => {
    const fetchData = async () => {
      if (!currentProject) return;

      try {
        setIsLoading(true);
        const response = await getGithubBlindSpotsInCode(currentProject.id);
        setExpertise(response as unknown as Record<string, string>);
      } catch (error) {
        console.error('Error fetching server/client distribution:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentProject]);

  // Get unique developers
  const developers = [...new Set(Object.values(expertise))];

  // Get developer colors (consistent colors for each developer)
  const getDeveloperColor = (developer: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-teal-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    const index = developers.indexOf(developer) % colors.length;
    return colors[index];
  };

  const getComponentIcon = (path: string) => {
    if (path.includes('database')) return <Database className="w-4 h-4" />;
    if (path.includes('packages')) return <Package className="w-4 h-4" />;
    if (path.includes('components')) return <Code className="w-4 h-4" />;
    return <Folder className="w-4 h-4" />;
  };

  // Filter expertise based on search and developer filter
  const filteredExpertise = Object.entries(expertise);

  return isLoading ? (
    <div className="absolute inset-0 bg-[#151921] bg-opacity-90 flex items-center justify-center z-0">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <span className="text-white text-lg">טוען מידע...</span>
      </div>
    </div>
  ) : (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-900 text-white rounded-xl">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold mb-4 text-slate-200">
          Places In Your Code That Only One Developer Knows
        </h2>

        {filteredExpertise.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No components found matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredExpertise.map(([path, developer]) => (
              <div
                key={path}
                className="bg-slate-800/30 backdrop-blur rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-all duration-200 hover:bg-slate-800/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-slate-400">
                      {getComponentIcon(path)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-mono text-sm text-slate-200 truncate"
                        title={path}
                      >
                        {path}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div
                      className={`w-2 h-2 rounded-full ${getDeveloperColor(
                        developer
                      )}`}
                    ></div>
                    <span className="text-sm font-medium text-white bg-slate-700/50 px-3 py-1 rounded-full">
                      {developer}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
