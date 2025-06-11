import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import './styles.css';
import { CurrentProjectProvider } from './context/CurrentProjectContext';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './context/AuthContext';
import { CurrentConnectedUserProvider } from './context/CurrentConnectedUserContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <QueryProvider>
      <CurrentProjectProvider>
        <BrowserRouter>
          <CurrentConnectedUserProvider>
            <App />
          </CurrentConnectedUserProvider>
        </BrowserRouter>
      </CurrentProjectProvider>
    </QueryProvider>
  </StrictMode>
);
