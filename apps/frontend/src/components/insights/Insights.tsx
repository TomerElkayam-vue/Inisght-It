import { useState } from 'react';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { WorkerStats } from './WorkerStats';
import { Prompt } from './Prompt';

export const Insights = () => {
  const { currentProject } = useCurrentProjectContext();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const employees =
    currentProject?.projectPermissions?.map(
      (permission) => `${permission.user.firstName} ${permission.user.lastName}`
    ) || [];

  if (!currentProject) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-gray-900 rounded-lg min-h-[80vh]">
      {/* Employee Selection */}
      <div className="w-full max-w-xl text-center">
        <h1 className="text-2xl font-bold text-white mb-4">בחירת עובד</h1>
        <div className="flex flex-wrap gap-2 justify-center">
          {employees.map((employee) => (
            <button
              key={employee}
              onClick={() => setSelectedEmployee(employee)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200
                ${
                  selectedEmployee === employee
                    ? 'bg-[#f8d94e] text-black shadow-lg scale-105'
                    : 'bg-[#2a2f4a] text-gray-300 hover:bg-[#3a3f5c] hover:scale-105'
                }`}
            >
              {employee}
            </button>
          ))}
        </div>
      </div>

      {selectedEmployee ? (
        <>
          {' '}
          {/* Worker Stats and AI Insights */}
          <div className="w-full max-w-4xl">
            <h1 className="text-xl font-bold text-white mb-4 text-right">
              סטטיסטיקות ותובנות
            </h1>
            <WorkerStats employee={selectedEmployee} />
          </div>
          {/* AI Chat */}
          <div className="w-full max-w-4xl">
            <h1 className="text-xl font-bold text-white mb-4 text-right">
              שאלות ותשובות
            </h1>
            <Prompt />
          </div>
        </>
      ) : (
        <div className="text-center text-gray-400 mt-8">
          <p className="text-lg">בחר עובד כדי לצפות בסטטיסטיקות ותובנות</p>
          <p className="text-sm mt-2">גלול למטה כדי לראות את כל המידע</p>
          <div className="mt-4 animate-bounce">
            <svg
              className="w-6 h-6 mx-auto text-[#f8d94e]"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
