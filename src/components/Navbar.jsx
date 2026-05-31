import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { usuario, estaAutenticado, logout } = useAuth();
  const { quantidadeTotal } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-50 bg-[#171a21]/95 backdrop-blur-md py-4 transition-all duration-300 border-b border-[#2a475e]/30">
      <div className="w-full max-w-6xl mx-auto px-4 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 no-underline group">
          <svg className="w-7 h-7 text-[#66c0f4] transition-transform duration-300 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
            <polyline strokeLinecap="round" strokeLinejoin="round" points="4 7 12 18 20 7" />
          </svg>
          <span className="text-white text-2xl font-bold tracking-[0.25em] font-sans uppercase">
            VAPOR
          </span>
        </Link>
        
        {/* MENU */}
        <div className="flex gap-4">
          {estaAutenticado && usuario ? (
            <div className="flex items-center gap-8">
              
              <div className="flex items-center gap-6">
                <button
                  onClick={() => navigate('/biblioteca')}
                  className="text-[#b8cedf] hover:text-white text-sm font-medium transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Biblioteca
                </button>
                
                <button
                  onClick={() => navigate('/estudio')}
                  className="text-[#b8cedf] hover:text-white text-sm font-medium transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Meus Jogos
                </button>
                
                <button
                  onClick={() => navigate('/carrinho')}
                  className="text-[#b8cedf] hover:text-white text-sm font-medium transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-2 group relative"
                >
                  <span>Carrinho</span>
                  <div className="relative">
                    <svg className="w-5 h-5 text-[#b8cedf] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    {quantidadeTotal > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#66c0f4] text-[#10141d] text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                        {quantidadeTotal}
                      </span>
                    )}
                  </div>
                </button>
              </div>
              
              <div className="w-[1px] h-8 bg-[#2a475e]/50"/>
              
              <div className="flex items-center gap-4">
                <div className="flex flex-col text-right justify-center">
                  <span className="text-[#66c0f4] font-semibold text-sm tracking-wide leading-tight cursor-default">
                    {usuario.nome || 'Usuário'}
                  </span>
                  <span className="text-[#567086] text-xs font-mono">
                    {usuario.matricula || ''}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-[#b8cedf] hover:text-[#e05e5e] transition-colors cursor-pointer p-1 ml-2"
                  title="Sair"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6">
                <button 
                  onClick={() => navigate('/login', { state: { modoPrimeiroAcesso: false } })}
                  className="text-[#b8cedf] hover:text-white text-sm font-medium transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Entrar
                </button>
                <button 
                  onClick={() => navigate('/login', { state: { modoPrimeiroAcesso: true } })}
                  className="px-5 py-2.5 rounded text-sm font-medium bg-[#1a7bcb] text-white hover:bg-[#1e85dc] transition-colors cursor-pointer uppercase tracking-wider shadow-md hover:shadow-lg"
                >
                  Criar Conta
                </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
