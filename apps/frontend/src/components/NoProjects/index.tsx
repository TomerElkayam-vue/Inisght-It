import { useNavigate } from 'react-router-dom';

const NoProjects = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#151921] flex items-center justify-center">
      <div className="bg-[#1e2530] p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-4">אין פרויקטים זמינים</h1>
        <p className="text-gray-300 mb-6">
          אין לך גישה לפרויקטים כרגע. אנא פנה למנהל המערכת כדי לקבל הרשאות מתאימות
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#2b3544] text-white px-6 py-2 rounded-lg hover:bg-[#353f4f] transition-colors"
        >
          נסה שוב
        </button>
      </div>
    </div>
  );
};

export default NoProjects; 