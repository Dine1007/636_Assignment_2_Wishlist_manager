// context/AuthContext.js
import { createContext, useState, useContext } from 'react';

// Singleton — one shared context instance for the entire app
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Persist user in localStorage so state survives page refresh
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Facade — hides useContext complexity, single clean hook for any component
export const useAuth = () => useContext(AuthContext);