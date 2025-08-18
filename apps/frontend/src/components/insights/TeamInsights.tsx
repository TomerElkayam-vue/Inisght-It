import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { Prompt } from './Prompt';
import { InsightsAI } from './InsightsAI';
import ToolsConfigureMessage from '../ToolsConfigureMessage';

export const TeamInsights = () => {
  const { currentProject } = useCurrentProjectContext();
  const hasCredentials = !!currentProject?.codeRepositoryCredentials?.token && !!currentProject?.codeRepositoryCredentials.token;

  if (!currentProject) {
    return null;
  }

  return hasCredentials ? (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-gray-900 rounded-lg">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-4 text-right">
          תובנות צוות
        </h1>
        <InsightsAI target={currentProject.id} type="team" />
      </div>
      <div className="w-full max-w-4xl">
        <h1 className="text-xl font-bold text-white mb-4 text-right">
          שאלות ותשובות
        </h1>
        <Prompt target={currentProject.id} type="team" />
      </div>
    </div>
  ) : (
    <ToolsConfigureMessage/>
  );
};
