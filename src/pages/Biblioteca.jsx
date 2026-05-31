import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bibliotecaService, jogosService } from '../services/api';

const IMAGEM_DEFAULT = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=500&auto=format&fit=crop';

export default function Biblioteca() {
  const navigate = useNavigate();
  const { usuario, estaAutenticado, token } = useAuth();

  const [jogos, setJogos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [deletando, setDeletando] = useState({});

  useEffect(() => {
    if (!token && !estaAutenticado) {
      navigate('/login');
      return;
    }

    if (estaAutenticado) {
      carregarBiblioteca();
    }
  }, [estaAutenticado, token, navigate]);

  const carregarBiblioteca = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const [dadosBiblioteca, dadosJogos] = await Promise.all([
        bibliotecaService.listar(),
        jogosService.listar(1, 100)
      ]);

      // A API retorna um array diretamente
      const itensBiblioteca = Array.isArray(dadosBiblioteca) ? dadosBiblioteca : (dadosBiblioteca.itens || []);
      const listaJogos = Array.isArray(dadosJogos) ? dadosJogos : (dadosJogos.itens || []);

      const jogosCompletos = itensBiblioteca.map(item => {
        const jogoParcial = item.jogo || item;
        const jogoCompleto = listaJogos.find(j => j.id === jogoParcial.id) || {};
        return {
          ...item,
          jogo: { 
            ...jogoParcial, 
            descricao: jogoCompleto.descricao || jogoParcial.descricao,
            desenvolvedora: jogoCompleto.desenvolvedora || jogoParcial.desenvolvedora,
            generos: jogoCompleto.generos || jogoParcial.generos
          }
        };
      });

      setJogos(jogosCompletos);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar sua biblioteca.');
      setJogos([]);
    } finally {
      setCarregando(false);
    }
  };

  const handleDeletarJogo = async (jogoId) => {
    if (!window.confirm('Tem certeza que deseja remover este jogo da sua biblioteca?')) {
      return;
    }

    try {
      setDeletando(prev => ({ ...prev, [jogoId]: true }));
      await bibliotecaService.deletar(jogoId);

      // Remover do estado local
      setJogos(prev => prev.filter(j => j.jogo.id !== jogoId));
      alert('Jogo removido da biblioteca com sucesso!');
    } catch (err) {
      alert(`Erro ao remover jogo: ${err.message}`);
    } finally {
      setDeletando(prev => ({ ...prev, [jogoId]: false }));
    }
  };

  if (carregando) {
    return <div className="text-center text-[#8f98a0] py-20 animate-pulse text-lg">Carregando sua biblioteca...</div>;
  }

  if (erro) {
    return (
      <div className="text-center text-[#e05e5e] py-10 px-6 border border-[#e05e5e]/20 bg-[#e05e5e]/10 rounded-xl max-w-xl mx-auto my-10 shadow-lg backdrop-blur-sm">
        <p className="font-semibold text-lg">Erro ao processar requisição.</p>
        <p className="text-sm text-[#e05e5e]/80 mt-2">{erro}</p>
        <button onClick={() => navigate('/')} className="mt-6 bg-gradient-to-r from-[#2a475e] to-[#203648] text-[#66c0f4] px-6 py-2 rounded-lg text-xs font-bold hover:from-[#345975] hover:to-[#2a475e] cursor-pointer border border-[#66c0f4]/30">
          Voltar para a Vitrine
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-[#8f98a0] hover:text-[#66c0f4] bg-transparent border-none cursor-pointer mb-6 text-sm flex items-center gap-2 font-medium transition-colors group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          VOLTAR PARA A LOJA
        </button>

        <h1 className="text-white font-light text-3xl tracking-wide uppercase">
          Minha Biblioteca
        </h1>
        <p className="text-[#8f98a0] text-sm mt-2">
          Olá, <span className="text-[#66c0f4] font-semibold">{usuario?.nome || 'Usuário'}</span>! Aqui estão todos os seus jogos salvos.
        </p>
      </div>

      {jogos && jogos.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jogos.map((item) => {
            const jogo = item.jogo || item;
            const horasJogadas = item.horasJogadas || 0;
            const adicionadoEm = item.adicionadoEm;

            return (
              <div
                key={jogo.id}
                className="group bg-[#16202d]/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#2a475e]/50 transition-all duration-400 hover:border-[#66c0f4]/60 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(102,192,244,0.12)] flex flex-col sm:flex-row shadow-lg h-full"
              >
                {/* IMAGE SECTION */}
                <div 
                  className="w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-[#0d121a] cursor-pointer relative overflow-hidden flex items-center justify-center border-b sm:border-b-0 sm:border-r border-[#2a475e]/30" 
                  onClick={() => navigate(`/jogo/${jogo.id}`)}
                >
                   <img 
                     src={jogo.capaUrl || IMAGEM_DEFAULT} 
                     alt={jogo.titulo}
                     className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 absolute inset-0" 
                     onLoad={(e) => {
                        const { naturalWidth, naturalHeight } = e.target;
                        if (naturalWidth / naturalHeight < 1.4) {
                            e.target.classList.remove('object-cover', 'object-top');
                            e.target.classList.add('object-contain');
                        }
                     }}
                     onError={(e) => {
                       e.target.onerror = null;
                       e.target.src = IMAGEM_DEFAULT;
                     }}
                   />
                </div>

                {/* CONTENT SECTION */}
                <div className="p-5 flex-1 flex flex-col justify-between min-w-0 overflow-hidden">
                  <div className="min-w-0">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div className="cursor-pointer min-w-0 flex-1 pr-2" onClick={() => navigate(`/jogo/${jogo.id}`)}>
                         <h3 className="text-white font-bold text-[18px] truncate group-hover:text-[#66c0f4] transition-colors tracking-wide drop-shadow-sm" title={jogo.titulo}>{jogo.titulo}</h3>
                         <span className="text-[#66c0f4] text-[10px] font-bold tracking-wider uppercase block truncate" title={jogo.desenvolvedora || "Desconhecido"}>
                             {jogo.desenvolvedora || "Desconhecido"}
                         </span>
                      </div>
                      <span className="text-[#b8cedf] font-bold text-sm bg-[#10141d]/80 px-2.5 py-1 rounded border border-[#2a475e]/50 shrink-0 whitespace-nowrap">
                         {jogo.preco > 0 ? `R$ ${jogo.preco.toFixed(2)}` : "Gratuito"}
                      </span>
                    </div>

                    <div className="text-[#8f98a0] text-xs font-mono tracking-tight flex flex-col gap-1.5 mt-5">
                       <span className="flex items-center gap-1.5 truncate">
                          <svg className="w-4 h-4 text-[#567086] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          Adicionado em: <strong className="text-[#b8cedf] font-semibold truncate">{adicionadoEm ? new Date(adicionadoEm).toLocaleDateString('pt-BR') : "Desconhecida"}</strong>
                       </span>
                       <span className="flex items-center gap-1.5 truncate">
                          <svg className="w-4 h-4 text-[#567086] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Horas jogadas: <strong className="text-[#66c0f4] font-bold truncate">{horasJogadas}h</strong>
                       </span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap justify-between items-center pt-4 mt-5 border-t border-[#2a475e]/30 gap-3">
                      <button 
                        onClick={() => handleDeletarJogo(jogo.id)}
                        disabled={deletando[jogo.id]}
                        className="text-[#e05e5e] hover:text-white bg-transparent hover:bg-[#e05e5e]/20 px-3 py-1.5 rounded text-xs font-bold transition-all border border-transparent hover:border-[#e05e5e]/30 flex items-center gap-1 cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        {deletando[jogo.id] ? 'Removendo...' : 'Remover'}
                      </button>
                      <button
                        onClick={() => navigate(`/jogo/${jogo.id}`)}
                        className="bg-gradient-to-r from-[#1a7bcb] to-[#145e9b] text-white hover:from-[#1e85dc] hover:to-[#176fa6] px-5 py-2 rounded-lg text-[11px] font-bold shadow-[0_4px_10px_rgba(26,123,203,0.3)] hover:shadow-[0_0_15px_rgba(102,192,244,0.4)] transition-all cursor-pointer uppercase tracking-wider flex items-center gap-1.5 group shrink-0"
                      >
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        Ver Jogo
                      </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-6 border border-[#2a475e]/30 bg-[#16202d]/80 backdrop-blur-md rounded-2xl max-w-xl mx-auto shadow-xl">
           <svg className="w-16 h-16 mx-auto text-[#567086] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
           <p className="text-[#b8cedf] text-lg font-medium">Sua biblioteca está vazia.</p>
           <p className="text-sm text-[#8f98a0] mt-2">Comece a adicionar jogos incríveis à sua coleção!</p>
           <button onClick={() => navigate('/')} className="mt-6 bg-gradient-to-r from-[#2a475e] to-[#203648] text-[#66c0f4] px-6 py-2.5 rounded-lg text-xs font-bold shadow-md hover:shadow-[0_0_15px_rgba(102,192,244,0.2)] transition-all cursor-pointer tracking-wide uppercase border border-[#66c0f4]/30 group flex items-center gap-2 mx-auto">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Explorar Catálogo
          </button>
        </div>
      )}
    </div>
  );
}
