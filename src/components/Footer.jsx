import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Footer() {
  const { estaAutenticado } = useAuth();

  return (
    <footer className="w-full bg-gradient-to-t from-[#0d0f15] to-[#10141d]/95 backdrop-blur-md border-t border-[#2a475e]/30 py-16 md:py-20 mt-20 selection:bg-[#66c0f4] selection:text-black">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-10 border-b border-[#2a475e]/25">
          {/* Logo e Descrição */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2.5 no-underline group w-fit">
              <svg className="w-6.5 h-6.5 text-[#66c0f4] transition-transform duration-300 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <polyline strokeLinecap="round" strokeLinejoin="round" points="4 7 12 18 20 7" />
              </svg>
              <span className="text-white text-xl font-bold tracking-[0.25em] uppercase font-sans">
                VAPOR
              </span>
            </Link>
            <p className="text-[#627d98] text-xs sm:text-[13px] max-w-sm leading-relaxed">
              Sua galeria de jogos oficial para publicar, comprar e gerenciar seus títulos favoritos.
            </p>
          </div>

          {/* Links Rápidos */}
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <Link to="/" className="text-[#b8cedf] hover:text-[#66c0f4] text-xs font-bold uppercase tracking-wider no-underline transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#66c0f4] hover:after:w-full after:transition-all after:duration-300">
              Vitrine
            </Link>
            {estaAutenticado && (
              <>
                <Link to="/biblioteca" className="text-[#b8cedf] hover:text-[#66c0f4] text-xs font-bold uppercase tracking-wider no-underline transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#66c0f4] hover:after:w-full after:transition-all after:duration-300">
                  Biblioteca
                </Link>
                <Link to="/estudio" className="text-[#b8cedf] hover:text-[#66c0f4] text-xs font-bold uppercase tracking-wider no-underline transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#66c0f4] hover:after:w-full after:transition-all after:duration-300">
                  Meus Jogos
                </Link>
              </>
            )}
            <Link to="/carrinho" className="text-[#b8cedf] hover:text-[#66c0f4] text-xs font-bold uppercase tracking-wider no-underline transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#66c0f4] hover:after:w-full after:transition-all after:duration-300">
              Carrinho
            </Link>
          </div>
        </div>

        {/* Rodapé Inferior - Autores e Licença */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 text-xs text-[#567086] font-sans">
          <div className="leading-relaxed">
            Criado por: <span className="text-[#66c0f4] font-semibold tracking-wide">Camily, Luiz Gustavo, William, Victor Hugo</span>
          </div>
          <div className="font-mono text-[11px]">
            &copy; {new Date().getFullYear()} Vapor. Todos os direitos reservados.
          </div>
        </div>

      </div>
    </footer>
  );
}
