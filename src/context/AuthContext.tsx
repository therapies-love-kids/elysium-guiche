import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from 'axios';

// Define o tipo para o contexto
interface AuthContextType {
  perfil: string;
  login: (nome: string, perfil: string) => void;
  logout: () => void;
}

// Cria o contexto com um valor padrão
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define o tipo das props do AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [perfil, setPerfil] = useState<string>(localStorage.getItem('perfil') || '');

  const login = (nome: string, newPerfil: string) => {
    setPerfil(newPerfil);
    localStorage.setItem('nome', nome);
    localStorage.setItem('perfil', newPerfil);
  };

  const logout = () => {
    setPerfil('');
    localStorage.removeItem('nome');
    localStorage.removeItem('perfil');
    // Remove qualquer autorização de página armazenada
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('authorized_')) {
        localStorage.removeItem(key);
      }
    });
    // Faz uma requisição para definir o usuário como offline
    const nome = localStorage.getItem('nome');
    if (nome) {
      axios.post('http://localhost:8080/usuarios/setUserOffline', null, {
        params: { nome },
      }).catch((err) => {
        console.error('Erro ao definir usuário como offline:', err);
      });
    }
  };

  return (
    <AuthContext.Provider value={{ perfil, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};