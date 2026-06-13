import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { usuario, estaAutenticado, logout } = useAuth();
  const { quantidadeTotal } = useCart();
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (menuAberto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuAberto]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#171a21]/95 backdrop-blur-md py-4 transition-all duration-300 border-b border-[#2a475e]/30">
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
        
        {/* MENU DESKTOP */}
        <div className="hidden lg:flex gap-4">
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

        {/* BOTÃO HAMBÚRGUER MOBILE */}
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="flex lg:hidden text-[#b8cedf] hover:text-white focus:outline-none p-2 cursor-pointer z-50 transition-colors"
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
        >
          {menuAberto ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* MENU MOBILE OVERLAY FIXED */}
      {menuAberto && (
        <div 
          className="fixed inset-0 top-[69px] z-40 bg-[#0d121a]/90 backdrop-blur-xl lg:hidden flex flex-col justify-start items-end"
          onClick={() => setMenuAberto(false)}
        >
          <div 
            className="w-full max-w-sm bg-[#171a21] border-b border-l border-[#2a475e]/40 p-6 flex flex-col gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {estaAutenticado && usuario ? (
              <>
                {/* Perfil do Usuário */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-[#2a475e]/30">
                  <div className="w-10 h-10 rounded-full bg-[#2a475e]/50 border border-[#66c0f4]/30 flex items-center justify-center text-[#66c0f4] font-bold text-base shadow-inner">
                    {usuario.nome ? usuario.nome[0].toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-white font-bold text-sm tracking-wide leading-tight">
                      {usuario.nome || 'Usuário'}
                    </span>
                    <span className="text-[#567086] text-xs font-mono mt-0.5">
                      {usuario.matricula || ''}
                    </span>
                  </div>
                </div>

                {/* Links de Navegação */}
                <button
                  onClick={() => { setMenuAberto(false); navigate('/biblioteca'); }}
                  className="text-left text-[#b8cedf] hover:text-white hover:bg-[#2a475e]/20 px-4 py-2.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider flex items-center gap-3 text-xs font-bold border border-transparent hover:border-[#2a475e]/30"
                >
                  <svg className="w-4.5 h-4.5 text-[#66c0f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Biblioteca
                </button>

                <button
                  onClick={() => { setMenuAberto(false); navigate('/estudio'); }}
                  className="text-left text-[#b8cedf] hover:text-white hover:bg-[#2a475e]/20 px-4 py-2.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider flex items-center gap-3 text-xs font-bold border border-transparent hover:border-[#2a475e]/30"
                >
                  <svg className="w-4.5 h-4.5 text-[#66c0f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Meus Jogos
                </button>

                <button
                  onClick={() => { setMenuAberto(false); navigate('/carrinho'); }}
                  className="text-left text-[#b8cedf] hover:text-white hover:bg-[#2a475e]/20 px-4 py-2.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider flex items-center justify-between w-full text-xs font-bold border border-transparent hover:border-[#2a475e]/30"
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-4.5 h-4.5 text-[#66c0f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    Carrinho
                  </span>
                  {quantidadeTotal > 0 && (
                    <span className="bg-[#66c0f4] text-[#10141d] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {quantidadeTotal}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { setMenuAberto(false); handleLogout(); }}
                  className="text-left text-[#e05e5e] hover:text-white hover:bg-[#e05e5e]/20 px-4 py-2.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider flex items-center gap-3 text-xs font-bold border border-transparent hover:border-[#e05e5e]/30 border-t border-[#2a475e]/20 pt-4"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Sair
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { setMenuAberto(false); navigate('/login', { state: { modoPrimeiroAcesso: false } }); }}
                  className="w-full text-center text-[#b8cedf] hover:text-white text-xs font-bold py-3 border border-[#2a475e]/50 rounded-lg transition-colors cursor-pointer uppercase tracking-wider hover:bg-[#2a475e]/25"
                >
                  Entrar
                </button>
                <button 
                  onClick={() => { setMenuAberto(false); navigate('/login', { state: { modoPrimeiroAcesso: true } }); }}
                  className="w-full text-center bg-[#1a7bcb] text-white hover:bg-[#1e85dc] text-xs font-bold py-3 rounded-lg transition-colors cursor-pointer uppercase tracking-wider shadow-md"
                >
                  Criar Conta
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
