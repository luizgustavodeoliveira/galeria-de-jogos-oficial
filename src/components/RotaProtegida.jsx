import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RotaProtegida({ children }) {
  const { estaAutenticado, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="text-center text-[#8f98a0] py-20 animate-pulse text-lg">
        Verificando autenticação...
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}