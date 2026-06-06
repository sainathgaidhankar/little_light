import { createContext, useContext, useEffect, useState } from 'react';
import { account, appwriteEnabled, ids } from '../lib/appwrite';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      if (!appwriteEnabled) {
        setLoading(false);
        return;
      }

      try {
        const current = await account.get();
        if (mounted) setUser(current);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    await account.createEmailPasswordSession(email, password);
    const current = await account.get();
    setUser(current);
    return current;
  };

  const logout = async () => {
    await account.deleteSession('current');
    setUser(null);
  };

  const isAdmin = Boolean(
    user &&
      (ids.adminEmail
        ? user.email === ids.adminEmail
        : user.labels?.includes('admin') || user.labels?.includes('administrator'))
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
