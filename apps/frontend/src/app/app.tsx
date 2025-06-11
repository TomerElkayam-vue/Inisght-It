import { useRoutes, useLocation } from 'react-router-dom';
import { routes } from '../router/routes';
import { Navbar } from '../components/Navbar';
import { useEffect } from 'react';
import { getToken, getRefreshToken, saveTokens } from '../services/auth.service';

export function App() {
  const location = useLocation();
  const element = useRoutes(routes);
  
  // Don't show navbar on login page
  const publicPath = routes[0].children?.map(({path}) => path);
  const showNavbar = !publicPath?.includes(location.pathname);

  useEffect(() => {
    const token = getToken();
    const refreshToken = getRefreshToken();
    
    if (token && refreshToken) {
      saveTokens(token, refreshToken);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#151921]">
      {showNavbar && <Navbar />}
      <main className={`${showNavbar ? 'pt-16' : ''} h-full`}>{element}</main>
    </div>
  );
}

export default App;
