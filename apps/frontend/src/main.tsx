import "./styles.css";
import App from "./app/app";
import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "./providers/QueryProvider";
import { CurrentProjectProvider } from "./context/CurrentProjectContext";
import { CurrentConnectedUserProvider } from "./context/CurrentConnectedUserContext";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <QueryProvider>
      <CurrentConnectedUserProvider>
        <CurrentProjectProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CurrentProjectProvider>
      </CurrentConnectedUserProvider>
    </QueryProvider>
  </StrictMode>
);
