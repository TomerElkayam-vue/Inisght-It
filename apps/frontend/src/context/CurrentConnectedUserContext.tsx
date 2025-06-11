import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

interface User {
  id: string;
  username: string;
}

interface CurrentConnectedUserContextType {
  user: User | null;
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
}

const CurrentConnectedUserContext = createContext<
  CurrentConnectedUserContextType | undefined
>(undefined);

export const useCurrentConnectedUser = () => {
  const context = useContext(CurrentConnectedUserContext);
  if (context === undefined) {
    throw new Error(
      'useCurrentConnectedUser must be used within a CurrentConnectedUserProvider'
    );
  }
  return context;
};

interface CurrentConnectedUserProviderProps {
  children: ReactNode;
}

export const CurrentConnectedUserProvider: React.FC<
  CurrentConnectedUserProviderProps
> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(() => {
    // Initialize token from localStorage
    return localStorage.getItem('jwt_token');
  });

  // Update localStorage when token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('jwt_token', token);
    } else {
      localStorage.removeItem('jwt_token');
    }
  }, [token]);

  const handleSetToken = (newToken: string | null) => {
    setTokenState(newToken);

    if (newToken) {
      // Decode the JWT token to get user data
      try {
        const base64Url = newToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const userData = JSON.parse(jsonPayload);
        console.log('user data in context', userData);
        // Set the user data
        setUser({
          id: userData.sub, // Use sub as the id
          username: userData.username,
        });
      } catch (error) {
        console.error('Error decoding token:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  return (
    <CurrentConnectedUserContext.Provider
      value={{
        user,
        token,
        setToken: handleSetToken,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </CurrentConnectedUserContext.Provider>
  );
};
