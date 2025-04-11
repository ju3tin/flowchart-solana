import React, { useState, useEffect, useCallback } from 'react';
import AuthContext from './AuthContext';
import { AuthContextType, User, RegisterResponse } from './AuthContextTypes';
import authApi, { getUser, login as loginApi } from '@/api/authApi';
import { ClipLoader } from 'react-spinners';
import { useColorModeValue } from '@/components/ui/color-mode';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstLoginAfterRegistration, setFirstLoginAfterRegistration] = useState(false);
  const [mounted, setMounted] = useState(false);

  const spinnerColor = useColorModeValue('var(--spinner-color-light)', 'var(--spinner-color-dark)'); 

  const updateWalletPublicKey = useCallback(
    async (newPublicKey: string) => {
      if (!user) return; // If nobody is logged in, do nothing
      try {
        setUser((prevUser) => {
          if (!prevUser) return null;
          const updatedUser = { ...prevUser, walletPublicKey: newPublicKey };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return updatedUser;
        });
      } catch (error) {
        console.error('updateWalletPublicKey error:', error);
      }
    },
    [user]
  );

  useEffect(() => {
    setMounted(true);
    
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      authApi.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    if (storedToken) {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      getUser()
        .then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        })
        .catch((err) => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete authApi.defaults.headers.common['Authorization'];
          console.error('Invalid token:', err);
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = useCallback(async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await loginApi(username, password);
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        authApi.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (orgName: string, username: string, password: string, code: string, openAiApiKey: string): Promise<RegisterResponse> => {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orgName, username, password, code, openAiApiKey }),
        });

        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          setFirstLoginAfterRegistration(true);
        }
        return data;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete authApi.defaults.headers.common['Authorization'];
  }, []);

  const updateApiKey = useCallback(async (newApiKey: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await fetch('/api/auth/update-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, newApiKey }),
      });

      setUser({ ...user, openAiApiKey: newApiKey });
      localStorage.setItem('user', JSON.stringify({ ...user, openAiApiKey: newApiKey }));
    } finally {
      setLoading(false);
    }
  }, [user]);

  const contextValue: AuthContextType = {
    user,
    setUser,
    login: loginUser,
    register,
    logout,
    firstLoginAfterRegistration,
    updateApiKey,
    loading,
    updateWalletPublicKey,
  };

  if (loading && mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ClipLoader size={50} color={spinnerColor} />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
