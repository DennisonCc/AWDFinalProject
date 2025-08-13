import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ username: 'admin', role: 'admin' });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading] = useState(false);

  const login = async (credentials) => {
    // Sin autenticación real, simplemente "logueamos" al usuario
    setUser({ username: 'admin', role: 'admin' });
    setIsAuthenticated(true);
    return { success: true, user: { username: 'admin', role: 'admin' } };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
