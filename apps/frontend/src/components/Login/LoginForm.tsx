import React, { useState, FormEvent } from 'react';
import { useCurrentConnectedUser } from '../../context/CurrentConnectedUserContext';
import { useNavigate } from 'react-router-dom';
import { login, saveTokens } from '../../services/auth.service';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { setToken } = useCurrentConnectedUser();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { accessToken, refreshToken } = await login({ username, password });
      saveTokens(accessToken, refreshToken);
      setToken(accessToken);
      navigate('/sprints-stats');
    } catch (err) {
      setError('שם משתמש או סיסמא שגויים');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#1e2530] rounded-3xl p-10">
        <h2 className="text-white text-3xl font-bold text-center mb-8">
          התחברות
        </h2>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} dir="rtl">
          <div className="mb-6">
            <label className="block text-white mb-2">שם משתמש</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#2b3544] text-white rounded-lg p-3 focus:outline-none"
              placeholder="הכנס שם משתמש"
              disabled={isLoading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-white mb-2">סיסמא</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#2b3544] text-white rounded-lg p-3 focus:outline-none"
              placeholder="הכנס סיסמא"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-[#2b3544] text-white rounded-lg p-3 mb-6 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#353f4f]'
            }`}
            disabled={isLoading}
          >
            התחברות
          </button>

          <div className="text-center">
            <p className="text-white text-sm">
              אין לך עדיין משתמש אצלנו?{' '}
              <a href="/register" className="text-white underline">
                לחץ כאן להרשמה
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
