import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

// Tipagem do usuário (ajuste conforme o retorno do backend)
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  description: string;
  photo: string;
}

// Tipagem do contexto
interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(name: string, email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  updateProfile(data: Partial<User>): Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Chaves compatíveis com SecureStore (sem '@' ou caracteres especiais)
const TOKEN_KEY = 'RealEstate_token';
const USER_KEY = 'RealEstate_user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega dados salvos ao iniciar o app
  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userData = await SecureStore.getItemAsync(USER_KEY);

      if (token && userData) {
        api.defaults.headers.common['x-auth-token'] = token;
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Erro ao carregar dados de armazenamento:', error);
    } finally {
      setLoading(false); // SEMPRE sai do loading
    }
  }

  // LOGIN
  async function signIn(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Salva token e usuário no SecureStore
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      // Configura header padrão para futuras requisições
      api.defaults.headers.common['x-auth-token'] = token;

      // Atualiza estado do contexto
      setUser(user);
    } catch (error: any) {
      console.error('Erro no login:', error.response?.data || error.message);
      throw error;
    }
  }

  // CADASTRO
  async function signUp(name: string, email: string, password: string) {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user } = response.data;

      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      api.defaults.headers.common['x-auth-token'] = token;
      setUser(user);
    } catch (error: any) {
      console.error('Erro no cadastro:', error.response?.data || error.message);
      throw error;
    }
  }

  // LOGOUT
  async function signOut() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    delete api.defaults.headers.common['x-auth-token'];
    setUser(null);
  }

  // ATUALIZAR PERFIL
  async function updateProfile(data: Partial<User>) {
    try {
      const response = await api.put('/profile', data);
      const updatedUser = { ...user, ...response.data } as User;
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error.response?.data || error.message);
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);