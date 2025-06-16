import { useState, useEffect, useMemo } from 'react';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { useCurrentConnectedUser } from '../../context/CurrentConnectedUserContext';
import { Prompt } from './Prompt';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '../../services/users.service';
import { useProjectRole } from '../../hooks/useProjectRole';
import {
  githubDataTypeToText,
  jiraDataTypeToText,
  StatsDashboard,
} from '../SprintsStats/StatsDashboard';
import { getGithubStats, GithubDataType } from '../../services/github.service';
import { getJiraStats, JiraDataType } from '../../services/jira.service';
import { InsightsAI } from './InsightsAI';

export type EmployeeSelection = {
  id: string;
  displayName: string;
};

export const WorkerInsights = () => {
  const { currentProject } = useCurrentProjectContext();
  const { user: currentConnectedUser } = useCurrentConnectedUser();

  const userRole = useMemo(
    () => useProjectRole(currentProject, currentConnectedUser),
    [currentProject, currentConnectedUser]
  );
  
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeSelection | null>(null);

  const { data: userDetails } = useQuery({
    queryKey: ['users'],
    queryFn: () => {
      return currentConnectedUser?.id
        ? usersService.getUserDetails(currentConnectedUser?.id)
        : null;
    },
  });

  useEffect(() => {
    if (userRole === 'MEMBER' && currentConnectedUser) {
      setSelectedEmployee({
        // TODO change
        displayName: `${currentConnectedUser.username}`,
        id: currentConnectedUser.id,
      });
    }
  }, [userRole, userDetails]);

  const employees: EmployeeSelection[] =
    currentProject?.projectPermissions?.map((permission) => ({
      id: permission.user.id,
      displayName: `${permission.user.firstName} ${permission.user.lastName}`,
    })) || [];

  if (!currentProject) {
    return null;
  }

  if (!userDetails && !userRole) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-900 rounded-lg min-h-[80vh]">
        <p className="text-xl text-gray-400 text-center">
          לא נמצא מידע על המשתמש הנוכחי
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-gray-900 rounded-lg">
      {/* Employee Selection - Only show for owners */}
      {userRole === 'OWNER' && (
        <div className="w-full max-w-xl text-center">
          <h1 className="text-2xl font-bold text-white mb-4">בחירת עובד</h1>
          <div className="flex flex-wrap gap-2 justify-center">
            {employees.map((employee) => (
              <button
                key={employee.id}
                onClick={() => setSelectedEmployee(employee)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200
                  ${
                    selectedEmployee?.id === employee.id
                      ? 'bg-[#f8d94e] text-black shadow-lg scale-105'
                      : 'bg-[#2a2f4a] text-gray-300 hover:bg-[#3a3f5c] hover:scale-105'
                  }`}
              >
                {employee.displayName}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedEmployee ? (
        <>
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="w-full md:w-1/2">
              <StatsDashboard
                dataTypeToText={githubDataTypeToText}
                initialSelectedDataType={GithubDataType.PR}
                fetchData={getGithubStats}
                isWorkerView={true}
                currentWorker={selectedEmployee.displayName}
              />
            </div>
            <div className="w-full md:w-1/2">
              <StatsDashboard
                dataTypeToText={jiraDataTypeToText}
                initialSelectedDataType={JiraDataType.ISSUES}
                fetchData={getJiraStats}
                isWorkerView={true}
                currentWorker={selectedEmployee.displayName}
              />
            </div>
          </div>
          {/* Worker AI Insights */}
          <div className="w-full max-w-4xl">
            <h1 className="text-xl font-bold text-white mb-4 text-right">
              סטטיסטיקות ותובנות
            </h1>
            <InsightsAI target={selectedEmployee.id} type="worker" />
          </div>
          {/* AI Chat */}
          <div className="w-full max-w-4xl">
            <h1 className="text-xl font-bold text-white mb-4 text-right">
              שאלות ותשובות
            </h1>
            <Prompt target={selectedEmployee.id} type="worker" />
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
