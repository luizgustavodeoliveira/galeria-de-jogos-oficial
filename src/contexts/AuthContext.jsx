import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // Buscar dados do usuário autenticado
  const buscarUsuario = useCallback(async () => {
    if (!token) {
      setUsuario(null);
      return;
    }

    try {
      setCarregando(true);
      const dados = await authService.me();
      setUsuario(dados);
      setErro(null);
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      setUsuario(null);
      // Token pode estar expirado, limpar
      localStorage.removeItem('token');
      setToken(null);
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, [token]);

  // Buscar usuário quando token muda
  useEffect(() => {
    if (token) {
      buscarUsuario();
    }
  }, [token, buscarUsuario]);

  const login = useCallback(async (matricula, senha) => {
    try {
      setCarregando(true);
      setErro(null);
      const dados = await authService.login(matricula, senha);
      
      localStorage.setItem('token', dados.token);
      setToken(dados.token);
      setUsuario(dados.usuario);
      
      return dados;
    } catch (err) {
      setErro(err.message);
      throw err;
    } finally {
      setCarregando(false);
    }
  }, []);

  const primeiroAcesso = useCallback(async (matricula, senha) => {
    try {
      setCarregando(true);
      setErro(null);
      const dados = await authService.primeiroAcesso(matricula, senha);
      
      // Não faz login automaticamente, apenas retorna a resposta
      return dados;
    } catch (err) {
      setErro(err.message);
      throw err;
    } finally {
      setCarregando(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
    setErro(null);
  }, []);

  const value = {
    usuario,
    token,
    carregando,
    erro,
    login,
    primeiroAcesso,
    logout,
    buscarUsuario,
    estaAutenticado: !!token && !!usuario
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
