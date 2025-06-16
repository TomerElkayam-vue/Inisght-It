import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, saveTokens } from '../../services/auth.service';
import { useCurrentConnectedUser } from '../../context/CurrentConnectedUserContext';

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { setToken } = useCurrentConnectedUser();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { accessToken, refreshToken } = await register({
        username,
        password,
        firstName,
        lastName,
      });
      saveTokens(accessToken, refreshToken);
      setToken(accessToken);
      navigate('/sprints-stats');
    } catch (err: any) {
      setError('שגיאה בהתחברות');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#1e2530] rounded-3xl p-10">
        <h2 className="text-white text-3xl font-bold text-center mb-8">
          הרשמה
        </h2>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} dir="rtl">
          <div className="mb-6">
            <label className="block text-white mb-2">שם פרטי</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-[#2b3544] text-white rounded-lg p-3 focus:outline-none"
              placeholder="הכנס שם פרטי"
              disabled={isLoading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-white mb-2">שם משפחה</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-[#2b3544] text-white rounded-lg p-3 focus:outline-none"
              placeholder="הכנס שם משפחה"
              disabled={isLoading}
            />
          </div>

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
            הרשמה
          </button>

          <div className="text-center">
            <p className="text-white text-sm">
              כבר יש לך משתמש?{' '}
              <a href="/" className="text-white underline">
                לחץ כאן להתחברות
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
