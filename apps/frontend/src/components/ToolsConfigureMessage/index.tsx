import { useNavigate } from 'react-router-dom';

const ToolsConfigureMessage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#151921] flex items-center justify-center">
      <div
        className="bg-[#1e2530] p-8 rounded-lg shadow-lg max-w-md w-full text-center"
        dir="rtl"
      >
        <h1 className="text-2xl font-bold text-white mb-4">
          רק עוד קצת...
        </h1>
        <p className="text-gray-300 mb-3">
          על מנת להציג תובנות עליך להגדיר את כלי הניהול בעמוד ניהול הפרויקט.
        </p>
        <div className="flex flex-row-reverse gap-4 justify-center">
          <button
            onClick={() => navigate('/project-management')}
            className="bg-[#f8d94e] hover:bg-[#e6c937] text-black px-4 py-2 rounded-lg transition-colors font-bold mt-2"
          >
            לעמוד ניהול הפרויקט
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolsConfigureMessage;
