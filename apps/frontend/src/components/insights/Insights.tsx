import { useState } from 'react';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { EmployeeInsights } from './EmployeeInsights';
import { TeamInsights } from './TeamInsights';

export const Insights = () => {
  const { currentProject } = useCurrentProjectContext();
  // TODO fetch employees from the current project
  const employees = [
    'Noam Ifat',
    'Shachar Shemesh',
    'Ron Aruch',
    'Tomer Elkayam',
    'Nitzan Hamzani',
  ];
  const [currentEmployee, setCurrentEmployee] = useState(employees[0]);

  // TODO divide to summery and insights and recommendations (maybe summery will be in the project stats page)
  // TODO add team insights
  return (
    <>
      {' '}
      {currentProject && (
        <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-gray-900 rounded-lg">
          {/* <h1 className="text-2xl font-bold text-white mb-6 text-right">
            תובנות צוותיות
          </h1>
          <TeamInsights /> */}
          {/* Employee Buttons */}
          <div className="flex gap-3">
            {employees.map((employee) => (
              <button
                key={employee}
                onClick={() => setCurrentEmployee(employee)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200
                  ${
                    currentEmployee === employee
                      ? 'bg-[#f8d94e] text-black shadow-md'
                      : 'bg-[#2a2f4a] text-gray-300 hover:bg-[#3a3f5c]'
                  }`}
              >
                {employee}
              </button>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-white mb-6 text-right">
            תובנות אישיות
          </h1>
          <EmployeeInsights employee={currentEmployee} />
        </div>
      )}
    </>
  );
};
