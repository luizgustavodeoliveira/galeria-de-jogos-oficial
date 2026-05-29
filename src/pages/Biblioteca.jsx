import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bibliotecaService } from '../services/api';

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
      const dados = await bibliotecaService.listar();

      // A API retorna um array diretamente
      const jogosFormatados = Array.isArray(dados) ? dados : (dados.itens || []);
      setJogos(jogosFormatados);
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
      <div className="text-center text-red-400 py-10 px-6 border border-red-500/20 bg-red-500/5 rounded-md max-w-xl mx-auto my-10">
        <p className="font-semibold">Erro ao processar requisição.</p>
        <p className="text-sm text-red-400/70 mt-1">{erro}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-xs bg-[#2a475e] text-white px-3 py-1.5 rounded hover:bg-[#345975] cursor-pointer">
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
          className="text-[#66c0f4] hover:underline bg-none border-none cursor-pointer mb-6 text-sm flex items-center gap-1 font-medium transition-colors"
        >
          ← Voltar para a Vitrine
        </button>

        <h1 className="text-white font-light text-3xl tracking-wide uppercase">
          Minha Biblioteca
        </h1>
        <p className="text-[#8f98a0] text-sm mt-2">
          Olá, <span className="text-[#66c0f4] font-semibold">{usuario?.nome || 'Usuário'}</span>! Aqui estão todos os seus jogos salvos.
        </p>
      </div>

      {jogos && jogos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
          {jogos.map((item) => {
            // A API retorna { jogo: {...}, horasJogadas, adicionadoEm }
            const jogo = item.jogo || item;
            const horasJogadas = item.horasJogadas || 0;
            const adicionadoEm = item.adicionadoEm;

            return (
              <div
                key={jogo.id}
                className="bg-pink-500/10 rounded overflow-hidden border border-pink-500/30 cursor-pointer transition-all duration-200 hover:border-pink-500/60 hover:-translate-y-1 shadow-lg flex flex-col justify-between"
              >
                <div
                  onClick={() => navigate(`/jogo/${jogo.id}`)}
                  className="w-full h-44 bg-pink-500/5 flex items-center justify-center p-2"
                >
                  <img
                    src={jogo.capaUrl || IMAGEM_DEFAULT}
                    alt={jogo.titulo}
                    className="w-full h-[160px] object-cover object-center bg-pink-500/5 block"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = IMAGEM_DEFAULT;
                    }}
                  />
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between min-h-[250px]">
                  <div>
                    <h3 className="text-white font-medium text-base truncate mb-1.5">{jogo.titulo}</h3>
                    <span className="text-[#567086] text-xs block mb-4">
                      {jogo.generos && jogo.generos.length > 0
                        ? jogo.generos.map((g) => g.nome).join(', ')
                        : "Sem gênero"}
                    </span>
                    {jogo.desenvolvedora ? (
                      <span className="text-pink-400 text-xs block mb-3 font-semibold tracking-wide uppercase">{jogo.desenvolvedora}</span>
                    ) : (
                      <span className="text-pink-400 text-xs block mb-3 font-semibold tracking-wide uppercase">Desenvolvedor desconhecido</span>
                    )}
                    <p className="text-[#acb2b8] text-xs leading-relaxed line-clamp-3 mb-3">
                      {jogo.descricao || "Sem descrição disponível."}
                    </p>
                  </div>
                </div>

                <div className="border-t border-pink-500/20 pt-3 flex flex-col gap-1 text-[11px] text-[#567086] p-2">
                  <div>
                    Adicionado em: <span className="text-[#8f98a0]">
                      {adicionadoEm ? new Date(adicionadoEm).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : "Data desconhecida"}
                    </span>
                  </div>

                  <div>
                    Horas jogadas: <span className="text-pink-400 font-medium">
                      {horasJogadas}h
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-2 gap-2">
                  <span className="text-[#b8cedf] font-bold text-sm">{`R$ ${jogo.preco?.toFixed(2) || '0,00'}`}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/jogo/${jogo.id}`)}
                      className="bg-pink-500/20 text-pink-300 px-3 py-2 rounded-sm text-xs font-bold hover:bg-pink-500/30 transition-colors cursor-pointer border border-pink-500/30 flex-1"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleDeletarJogo(jogo.id)}
                      disabled={deletando[jogo.id]}
                      className="bg-red-500/20 text-red-300 px-3 py-2 rounded-sm text-xs font-bold hover:bg-red-500/30 transition-colors cursor-pointer border border-red-500/30 disabled:opacity-50"
                    >
                      {deletando[jogo.id] ? '...' : 'X'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-6 border border-pink-500/20 bg-pink-500/5 rounded-md max-w-xl mx-auto">
          <p className="text-[#8f98a0] font-semibold">Sua biblioteca está vazia.</p>
          <p className="text-sm text-[#8f98a0]/70 mt-1">Comece a adicionar jogos à sua biblioteca!</p>
          <button onClick={() => navigate('/')} className="mt-4 text-xs bg-pink-500/20 text-pink-300 px-3 py-1.5 rounded hover:bg-pink-500/30 cursor-pointer border border-pink-500/30">
            Explorar Catálogo
          </button>
        </div>
      )}
    </div>
  );
}
