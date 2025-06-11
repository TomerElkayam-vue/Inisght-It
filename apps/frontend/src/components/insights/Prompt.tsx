import { useState } from 'react';
import { getQuestionAnswer } from '../../services/ai.service';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';

interface Message {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface PromptProps {
  target: string; // userId for worker insights, projectId for team insights
  type: 'worker' | 'team';
}

export const Prompt = ({ target, type }: PromptProps) => {
  const { currentProject } = useCurrentProjectContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const MAX_INPUT_LENGTH = 500;

  const handleSend = async () => {
    if (!inputValue.trim() || !currentProject) return;

    if (editingMessageId) {
      // Update existing message
      setMessages(
        messages.map((msg) =>
          msg.id === editingMessageId ? { ...msg, question: inputValue } : msg
        )
      );
      setEditingMessageId(null);
    } else {
      // Add new message
      const newMessage: Message = {
        id: Date.now().toString(),
        question: inputValue,
        answer: '',
        timestamp: new Date(),
        isLoading: true,
      };
      setMessages([...messages, newMessage]);

      try {
        const response = await getQuestionAnswer(
          { question: inputValue },
          currentProject.id,
          type === 'worker' ? target : undefined,
          type
        );
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === newMessage.id
              ? {
                  ...msg,
                  answer: response.answer,
                  isLoading: false,
                }
              : msg
          )
        );
      } catch (error) {
        console.error('Error getting answer:', error);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === newMessage.id
              ? {
                  ...msg,
                  answer:
                    'Sorry, there was an error getting the answer. Please try again.',
                  isLoading: false,
                }
              : msg
          )
        );
      }
    }
    setInputValue('');
  };

  const handleRegenerate = async (messageId: string) => {
    if (!currentProject) return;

    const message = messages.find((msg) => msg.id === messageId);
    if (!message) return;

    setMessages(
      messages.map((msg) =>
        msg.id === messageId ? { ...msg, isLoading: true } : msg
      )
    );

    try {
      const response = await getQuestionAnswer(
        { question: message.question },
        currentProject.id,
        type === 'worker' ? target : undefined,
        type
      );
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                answer: response.answer,
                isLoading: false,
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Error regenerating answer:', error);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                answer:
                  'Sorry, there was an error regenerating the answer. Please try again.',
                isLoading: false,
              }
            : msg
        )
      );
    }
  };

  const handleDelete = (messageId: string) => {
    setMessages(messages.filter((msg) => msg.id !== messageId));
  };

  const handleEdit = (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      setInputValue(message.question);
      setEditingMessageId(messageId);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    setInputValue('');
    setEditingMessageId(null);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto space-y-4" dir="rtl">
      {/* Messages */}
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="bg-[#2a2f4a] rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-gray-300 text-right">{message.question}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRegenerate(message.id)}
                  className="text-gray-400 hover:text-[#f8d94e] transition-colors"
                  title="Regenerate answer"
                >
                  {message.isLoading ? (
                    <span className="animate-spin">⟳</span>
                  ) : (
                    '↻'
                  )}
                </button>
                <button
                  onClick={() => handleEdit(message.id)}
                  className="text-gray-400 hover:text-[#f8d94e] transition-colors"
                  title="Edit question"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleCopy(message.answer)}
                  className="text-gray-400 hover:text-[#f8d94e] transition-colors"
                  title="Copy answer"
                >
                  ⎘
                </button>
                <button
                  onClick={() => handleDelete(message.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete message"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="text-white whitespace-pre-line text-right">
              {message.isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#f8d94e] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#f8d94e] rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-[#f8d94e] rounded-full animate-bounce delay-200" />
                </div>
              ) : (
                message.answer
              )}
            </div>
            <div className="text-gray-500 text-sm mt-2 text-left">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) =>
                setInputValue(e.target.value.slice(0, MAX_INPUT_LENGTH))
              }
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={
                editingMessageId ? 'ערוך את השאלה שלך...' : 'שאל שאלה...'
              }
              className="w-full px-4 py-2 bg-[#2a2f4a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8d94e] text-right"
              dir="rtl"
            />
            {inputValue && (
              <button
                onClick={handleClear}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="px-6 py-2 bg-[#f8d94e] text-black font-semibold rounded-lg hover:bg-[#e6c73d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingMessageId ? 'עדכן' : 'שלח'}
          </button>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>
            {inputValue.length}/{MAX_INPUT_LENGTH} תווים
          </span>
          {editingMessageId && (
            <button
              onClick={() => {
                setEditingMessageId(null);
                setInputValue('');
              }}
              className="text-[#f8d94e] hover:text-[#e6c73d]"
            >
              ביטול עריכה
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
