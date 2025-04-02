import { useUserData } from '../hooks/UseUserData';

export const UserInsights = () => {
  const { userData } = useUserData();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6 text-right">
        תובנות אישיות
      </h1>

      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 text-right">
          תומר אלקיים
        </h2>

        <div className="space-y-4"></div>
      </div>
    </div>
  );
};
