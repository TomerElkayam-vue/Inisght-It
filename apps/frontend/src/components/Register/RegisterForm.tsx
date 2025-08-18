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

  const [usernameError, setUsernameError] = useState<string>('');
  const [firstNameError, setFirstNameError] = useState<string>('');
  const [lastNameError, setLastNameError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  const { setToken } = useCurrentConnectedUser();

  const handleUsernameChange = (value: string) => {
    if (value.length > 15)
      setUsernameError('שם המשתמש לא יכול להיות יותר מ-15 תווים');
    else setUsernameError('');
    setUsername(value.slice(0, 15));
  };

  const handleFirstNameChange = (value: string) => {
    if (value.length > 20)
      setFirstNameError('שם פרטי לא יכול להיות יותר מ-20 תווים');
    else setFirstNameError('');
    setFirstName(value.slice(0, 20));
  };

  const handleLastNameChange = (value: string) => {
    if (value.length > 20)
      setLastNameError('שם משפחה לא יכול להיות יותר מ-20 תווים');
    else setLastNameError('');
    setLastName(value.slice(0, 20));
  };

  const handlePasswordChange = (value: string) => {
    if (value.length > 30)
      setPasswordError('סיסמא לא יכולה להיות יותר מ-30 תווים');
    else setPasswordError('');
    setPassword(value.slice(0, 30));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (usernameError || firstNameError || lastNameError || passwordError)
      return;

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
      setError('שגיאה בהרשמה');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = (hasError: boolean) =>
    `w-full rounded-lg p-3 focus:outline-none ${
      hasError
        ? 'bg-[#ffdddd] border border-red-500 text-red-600'
        : 'bg-[#2b3544] text-white'
    }`;

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
          {/* First Name */}
          <div className="mb-6">
            <label className="block text-white mb-2">שם פרטי</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => handleFirstNameChange(e.target.value)}
              className={getInputClass(!!firstNameError)}
              placeholder="הכנס שם פרטי"
              disabled={isLoading}
            />
            {firstNameError && (
              <p className="text-red-500 text-sm mt-1">{firstNameError}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="mb-6">
            <label className="block text-white mb-2">שם משפחה</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => handleLastNameChange(e.target.value)}
              className={getInputClass(!!lastNameError)}
              placeholder="הכנס שם משפחה"
              disabled={isLoading}
            />
            {lastNameError && (
              <p className="text-red-500 text-sm mt-1">{lastNameError}</p>
            )}
          </div>

          {/* Username */}
          <div className="mb-6">
            <label className="block text-white mb-2">שם משתמש</label>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              className={getInputClass(!!usernameError)}
              placeholder="הכנס שם משתמש"
              disabled={isLoading}
            />
            {usernameError && (
              <p className="text-red-500 text-sm mt-1">{usernameError}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-white mb-2">סיסמא</label>
            <input
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className={getInputClass(!!passwordError)}
              placeholder="הכנס סיסמא"
              disabled={isLoading}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full rounded-lg p-3 mb-6 ${
              isLoading ||
              !firstName ||
              !lastName ||
              !username ||
              !password ||
              usernameError ||
              firstNameError ||
              lastNameError ||
              passwordError
                ? 'bg-[#2b3544] opacity-50 cursor-not-allowed'
                : 'bg-[#2b3544] text-white hover:bg-[#353f4f]'
            }`}
            disabled={
              isLoading ||
              !firstName ||
              !lastName ||
              !username ||
              !password ||
              !!usernameError ||
              !!firstNameError ||
              !!lastNameError ||
              !!passwordError
            }
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
