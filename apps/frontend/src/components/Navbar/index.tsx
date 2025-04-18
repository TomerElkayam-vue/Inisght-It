import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoDark from '../../assets/logo-dark.png';
import { removeToken } from '../../services/auth.service';
import { useEffect } from 'react';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-[#2b3544]' : '';
  };

  const handleLogout = () => {
    removeToken();
    navigate('/');
  };

  const redirectToGitHub = () => {
    const clientId = 'Ov23liBqFboVyeJfPkKc';
    const redirectUri = 'http://localhost:3000/api/github/callback';
    const scope = 'repo';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    console.log(token);
  }, []);

  return (
    <nav className="bg-[#1e2530] h-16 fixed w-full top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center">
            <img src={logoDark} alt="Logo" className="h-10 w-auto" />
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/stats"
              className={`text-white px-4 py-2 rounded-lg transition-colors ${isActive(
                '/stats'
              )}`}
            >
              סטטיסטיקות
            </Link>
            <Link
              to="/insights"
              className={`text-white px-4 py-2 rounded-lg transition-colors ${isActive(
                '/insights'
              )}`}
            >
              תובנות צוותיות
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white">שלום שחר שמש</span>
            <button
              className="bg-[#2b3544] text-white px-4 py-2 rounded-lg hover:bg-[#353f4f] transition-colors"
              onClick={redirectToGitHub}
            >
              חבר את גיטהאב
            </button>
            <button
              className="bg-[#2b3544] text-white px-4 py-2 rounded-lg hover:bg-[#353f4f] transition-colors"
              onClick={handleLogout}
            >
              התנתק
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
