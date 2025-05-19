import { useRoutes, useLocation } from 'react-router-dom';
import { routes } from '../router/routes';
import { Navbar } from '../components/Navbar';

export function App() {
  const location = useLocation();
  const element = useRoutes(routes);
  
  // Don't show navbar on login page
  const publicPath = routes[0].children?.map(({path}) => path);
  const showNavbar = !publicPath?.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#151921]">
      {showNavbar && <Navbar />}
      <main className={`${showNavbar ? 'pt-16' : ''} h-full`}>{element}</main>
    </div>
  );
}

export default App;
