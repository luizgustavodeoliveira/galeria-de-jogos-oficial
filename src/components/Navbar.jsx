import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { usuario, estaAutenticado, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  return (
    <header className="bg-[#171a21] px-[10%] py-4 border-b border-[#2a475e]/40 flex items-center justify-between shadow-md">
      <Link to="/" className="flex items-center gap-3 no-underline group">
        <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#101822] to-[#2a475e] border border-[#66c0f4] flex items-center justify-center text-[#66c0f4] font-bold text-lg transition-transform group-hover:scale-105">
          V
        </div>
        <span className="text-white text-2xl font-bold tracking-widest uppercase font-mono">VAPOR</span>
      </Link>
      
      <div className="flex gap-4">
        {estaAutenticado && usuario ? (
          <div className="flex items-center gap-5 bg-[#10141d]/60 px-4 py-1.5 rounded border border-[#2a475e]/30">
            <button
              onClick={() => navigate('/biblioteca')}
              className="text-[#66c0f4] hover:text-white text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
            >
              Biblioteca
            </button>
            <div className="w-[1px] h-4 bg-[#2a475e]/40 mx-2"/>
            <button
              onClick={() => navigate('/estudio')}
              className="text-[#66c0f4] hover:text-white text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
            >
              Meu Estúdio
            </button>
            
            <div className="w-[1px] h-6 bg-[#2a475e]/40"/>
            
            <div className="flex flex-col text-right">
              <span className="text-white font-semibold text-sm font-sans tracking-wide">
                {usuario.nome || 'Usuário'}
              </span>
              <span className="text-[#567086] text-[11px] font-mono">
                {usuario.matricula || ''}
              </span>
            </div>

            <div className="w-[1px] h-6 bg-[#2a475e]/40"/>

            <button
              onClick={handleLogout}
              className="text-[#e05e5e] hover:text-red-400 text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
            >
              Sair
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
              <button 
                onClick={() => navigate('/login', { state: { modoPrimeiroAcesso: false } })}
                className="px-4 py-2 rounded text-sm font-semibold border border-[#66c0f4] text-[#66c0f4] hover:bg-[#66c0f4]/10 transition-colors cursor-pointer"
              >
                Entrar
              </button>
              <button 
                onClick={() => navigate('/login', { state: { modoPrimeiroAcesso: true } })}
                className="px-4 py-2 rounded text-sm font-semibold bg-[#1a7bcb] text-white hover:bg-[#1e85dc] transition-colors shadow-lg cursor-pointer"
              >
                Primeiro Acesso
              </button>
          </div>
        )}
      </div>
    </header>
  );
}
