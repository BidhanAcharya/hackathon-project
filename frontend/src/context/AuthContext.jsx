import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // user shape: { anonId, role: 'seeker'|'helper', sessionToken }

  const loginAsSeeker = (anonId, sessionToken) => {
    setUser({ anonId, role: 'seeker', sessionToken });
  };

  const loginAsHelper = (name, sessionToken) => {
    setUser({ name, role: 'helper', sessionToken });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loginAsSeeker, loginAsHelper, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
