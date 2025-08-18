import { simpleUser } from './interfaces';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '../../services/users.service';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { useProjectManagementContext } from '../../context/ProjectManagementContext';

const ProjectMembers = ({
  save,
  disableSave,
}: {
  save: () => void;
  disableSave: boolean;
}) => {
  const { currentProject } = useCurrentProjectContext();
  const { members, setMembers } = useProjectManagementContext();

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
    return members.map((employee) => employee.id);
  }, [members]);

  const suggestedUsers = useMemo(() => {
    return (
      users?.filter?.(
        (user) =>
          !(employeesIds?.includes(user.id) || managersIds?.includes(user.id))
      ) ?? []
    );
  }, [users, members, managersIds]);

  const [filteredUsers, setFilteredUsers] = useState<simpleUser[] | undefined>(
    suggestedUsers
  );

  const noNewChange = useMemo(() => {
    const originalEmployeesIds =
      currentProject?.projectPermissions
        ?.filter((permission) => permission.roleId !== 1)
        ?.map((permission) => permission.user.id)
        ?.sort() ?? [];
    const currentEmployeesIds = members.map((e) => e.id).sort();
    if (originalEmployeesIds.length !== currentEmployeesIds.length)
      return false;
    return originalEmployeesIds.every(
      (id, idx) => id === currentEmployeesIds[idx]
    );
  }, [currentProject?.projectPermissions, members]);

  const handleAdd = () => {
    if (newMember.id) {
      setMembers([...members, newMember]);
      setNewMember(newMember);
      setShowModal(false);
    }
  };

  const handleDelete = (index: number) => {
    const newEmployees = members.filter((_, idx) => idx !== index);
    setMembers(newEmployees);
  };

  const handleInputChange = (value: string) => {
    setSearchValue(value);
    const filter = suggestedUsers?.filter((user) =>
      user.username.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filter);
  };

  const usernameToDisplay = (username: string, lenght?: number) => {
    const maxLength = lenght ?? 18;
    if (!username) return '';
    if (username.length <= maxLength) return username;
    return username.slice(0, maxLength - 1) + '…';
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
            className="bg-[#f8d94e] hover:bg-[#e6c937] text-black rounded-full w-8 h-8 flex items-center justify-center text-lg"
            title="הוסף משתמש"
          >
            +
          </button>
        </div>

        <div className="space-y-3">
          {members.map((employee, index) => (
            <div
              key={index}
              className="bg-[#3a3a4d] rounded-lg p-3 text-sm flex justify-between items-center"
              dir="rtl"
            >
              <span title={employee.username} className="text-right">
                {usernameToDisplay(employee.username)}
              </span>
              <button
                onClick={() => handleDelete(index)}
                className="text-red-500 hover:text-red-400"
                title="הסר משתמש"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex justify-center">
            <button
              onClick={save}
              className={`relative px-10 py-1 text-base font-medium rounded-md shadow-md text-black transition duration-300 ease-in-out ${
                disableSave
                  ? 'bg-gray-400 cursor-not-allowed'
                  : noNewChange
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-[#f8d94e] hover:bg-[#e6c937]'
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
            <div className="bg-[#2e2e3e] p-6 rounded-xl w-[672px]" dir="rtl">
              <h3 className="text-md font-bold mb-4">הוסף משתמש לפרויקט</h3>
              <input
                type="text"
                className="w-full p-2 mb-2 rounded-md bg-[#3a3a4d] text-white focus:outline-none"
                placeholder="שם המשתמש"
                value={searchValue}
                onChange={(e) => handleInputChange(e.target.value)}
              />
              {filteredUsers && filteredUsers.length > 0 && (
                <ul className="bg-[#3a3a4d] rounded-md max-h-32 overflow-auto custom-scrollbar text-sm text-right">
                  {filteredUsers.map((user, idx) => (
                    <li
                      key={idx}
                      className="p-2 hover:bg-[#e6c937] hover:text-black cursor-pointer"
                      onClick={() => {
                        setNewMember(user);
                        setSearchValue(user.username);
                      }}
                      title={user.username}
                    >
                      {usernameToDisplay(user.username, 35)}
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
                  className="px-3 py-1 rounded-md bg-[#f8d94e] hover:bg-[#e6c937] text-black"
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
