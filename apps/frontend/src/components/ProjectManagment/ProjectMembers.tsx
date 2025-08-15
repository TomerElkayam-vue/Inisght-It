import { simpleUser } from './interfaces';
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../services/users.service';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { useProjectManagementContext } from '../../context/ProjectManagementContext';

// TODO: add server logic
const ProjectMembers = ({
  save,
  disableSave,
}: {
  save: () => void;
  disableSave: boolean;
}) => {
  const { currentProject } = useCurrentProjectContext();
  const { employees, setEmployees } = useProjectManagementContext();

  const [showModal, setShowModal] = useState(false);
  const [newMember, setNewMember] = useState<simpleUser>({} as simpleUser);
  const [searchValue, setSearchValue] = useState('');

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => {
      return usersService.getUsers();
    },
  });

  const managersIds = useMemo(() => {
    return currentProject?.projectPermissions
      ?.filter((permission) => permission.roleId === 1)
      ?.map((permission) => permission.user.id);
  }, [currentProject?.projectPermissions]);

  const employeesIds = useMemo(() => {
    return employees.map((employee) => employee.id);
  }, [employees]);

  const suggestedUsers = useMemo(() => {
    return (
      users?.filter?.(
        (user) =>
          !(employeesIds?.includes(user.id) || managersIds?.includes(user.id))
      ) ?? []
    );
  }, [users, employees, managersIds]);

  const [filteredUsers, setFilteredUsers] = useState<simpleUser[] | undefined>(
    suggestedUsers
  );

  const noNewChange = useMemo(() => {
    const originalEmployeesIds =
      currentProject?.projectPermissions
        ?.filter((permission) => permission.roleId !== 1)
        ?.map((permission) => permission.user.id)
        ?.sort() ?? [];
    const currentEmployeesIds = employees.map((e) => e.id).sort();
    if (originalEmployeesIds.length !== currentEmployeesIds.length)
      return false;
    return originalEmployeesIds.every(
      (id, idx) => id === currentEmployeesIds[idx]
    );
  }, [currentProject?.projectPermissions, employees]);

  const handleAdd = () => {
    if (newMember.id) {
      setEmployees([...employees, newMember]);
      setNewMember(newMember);
      setShowModal(false);
    }
  };

  const handleDelete = (index: number) => {
    const newEmployees = employees.filter((_, idx) => idx !== index);
    setEmployees(newEmployees);
  };

  const handleInputChange = (value: string) => {
    setSearchValue(value);
    const filter = suggestedUsers?.filter((user) =>
      user.username.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filter);
  };

  return (
    <div className="flex items-center justify-center bg-[#1e1e2f] text-white">
      <div
        dir="rtl"
        className="bg-[#2e2e3e] p-6 rounded-3xl w-80 shadow-lg relative"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">משתמשים</h2>
          <button
            onClick={() => {
              setShowModal(true);
              setNewMember({} as simpleUser);
              setSearchValue('');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg"
            title="הוסף משתמש"
          >
            +
          </button>
        </div>

        <div className="space-y-3">
          {employees.map((employee, index) => (
            <div
              key={index}
              className="bg-[#3a3a4d] rounded-lg p-3 text-sm flex justify-between items-center"
            >
              <button
                onClick={() => handleDelete(index)}
                className="text-red-500 hover:text-red-400"
                title="הסר משתמש"
              >
                ✕
              </button>
              <span>{employee.username}</span>
            </div>
          ))}
          <div className="flex justify-center">
            <button
              onClick={save}
              className={`relative px-10 py-1 text-base font-medium rounded-md shadow-md transition duration-300 ease-in-out ${
                disableSave
                  ? 'bg-gray-400 cursor-not-allowed'
                  : noNewChange
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
              disabled={noNewChange || disableSave}
            >
              {disableSave ? 'שומר...' : 'שמור'}
            </button>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#2e2e3e] p-6 rounded-xl w-80" dir="rtl">
              <h3 className="text-md font-bold mb-4">הוסף משתמש לפרויקט</h3>
              <input
                type="text"
                className="w-full p-2 mb-2 rounded-md bg-[#3a3a4d] text-white focus:outline-none"
                placeholder="שם המשתמש"
                value={searchValue}
                onChange={(e) => handleInputChange(e.target.value)}
              />
              {filteredUsers && filteredUsers.length > 0 && (
                <ul className="bg-[#3a3a4d] rounded-md max-h-32 overflow-auto text-sm text-right">
                  {filteredUsers.map((user, idx) => (
                    <li
                      key={idx}
                      className="p-2 hover:bg-blue-500 cursor-pointer"
                      onClick={() => {
                        setNewMember(user);
                        setSearchValue(user.username);
                      }}
                    >
                      {user.username}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1 rounded-md bg-gray-500 hover:bg-gray-600"
                >
                  ביטול
                </button>
                <button
                  onClick={handleAdd}
                  className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700"
                >
                  הוסף
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMembers;
