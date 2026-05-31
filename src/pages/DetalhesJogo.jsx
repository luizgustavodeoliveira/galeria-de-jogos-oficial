import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { jogosService, reviewsService, bibliotecaService } from '../services/api';

const IMAGEM_DEFAULT = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=500&auto=format&fit=crop';

export default function DetalhesJogo() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { usuario, estaAutenticado } = useAuth();
  const { adicionarAoCarrinho, cartItems } = useCart();
  
  const [jogo, setJogo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [comentarios, setComentarios] = useState('');
  const [recomenda, setRecomenda] = useState(true);
  const [nota, setNota] = useState(10);
  const [enviandoReview, setEnviandoReview] = useState(false);
  const [adicionandoBiblioteca, setAdicionandoBiblioteca] = useState(false);
  const [naBiblioteca, setNaBiblioteca] = useState(false);

  useEffect(() => {
    carregarJogo();
    if (estaAutenticado) {
      verificarBiblioteca();
    }
  }, [id, estaAutenticado]); 

  const carregarJogo = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const dados = await jogosService.obter(id);
      setJogo(dados);
      
      // Carregar reviews do jogo
      if (dados.reviews && Array.isArray(dados.reviews)) {
        setReviews(dados.reviews);
      }
    } catch (err) {
      setErro(err.message || 'Este jogo não foi localizado no servidor.');
      setJogo(null);
    } finally {
      setCarregando(false);
    }
  };

  const verificarBiblioteca = async () => {
    try {
      const biblioteca = await bibliotecaService.listar();
      const itens = Array.isArray(biblioteca) ? biblioteca : (biblioteca.itens || []);
      const jogoSalvo = itens.find(item => {
        const j = item.jogo || item;
        return j.id === parseInt(id);
      });
      setNaBiblioteca(!!jogoSalvo);
    } catch (err) {
      console.error('Erro ao verificar biblioteca', err);
    }
  };

  const handleEnviarReview = async (e) => {
    e.preventDefault();
    if(!comentarios.trim()) {
      alert('Por favor, escreva um comentário antes de enviar sua análise.');
      return;
    }

    setEnviandoReview(true);

    try {
      const novaReview = await reviewsService.criar(parseInt(id), {
        nota: parseInt(nota, 10),
        texto: comentarios,
        recomenda: recomenda
      });

      // Salvar a review no localStorage
      const reviewsLocais = JSON.parse(localStorage.getItem('reviews') || '[]');
      reviewsLocais.push(novaReview);
      localStorage.setItem('reviews', JSON.stringify(reviewsLocais));

      // Adicionar a nova review à lista
      setReviews(prev => [novaReview, ...prev]);
      
      alert('Análise enviada com sucesso!');
      setComentarios('');
      setRecomenda(true);
      setNota(10);
      
      // Recarregar jogo para atualizar contagem de reviews
      await carregarJogo();
    } catch (erro) {
      alert(`Erro ao enviar análise: ${erro.message}`);
    } finally {
      setEnviandoReview(false);
    }
  };

  const handleDeletarReview = async (reviewId) => {
    if (!window.confirm('Tem certeza que deseja deletar sua análise?')) return;
    try {
      await reviewsService.deletar(reviewId);
      alert('Análise deletada com sucesso!');
      await carregarJogo();
    } catch (erro) {
      alert(`Erro ao deletar análise: ${erro.message}`);
    }
  };

  const handleAdicionarBiblioteca = async () => {
    if (!estaAutenticado) {
      navigate('/login');
      return;
    }

    try {
      setAdicionandoBiblioteca(true);
      await bibliotecaService.adicionar(parseInt(id));
      setNaBiblioteca(true);
      alert(`"${jogo.titulo}" foi adicionado à sua biblioteca!`);
    } catch (erro) {
      alert(`Erro ao adicionar à biblioteca: ${erro.message}`);
    } finally {
      setAdicionandoBiblioteca(false);
    }
  };

  const handleRemoverBiblioteca = async () => {
    if (!window.confirm('Tem certeza que deseja remover da sua biblioteca?')) return;
    try {
      setAdicionandoBiblioteca(true);
      await bibliotecaService.deletar(parseInt(id));
      setNaBiblioteca(false);
      alert(`"${jogo.titulo}" foi removido da sua biblioteca!`);
    } catch (erro) {
      alert(`Erro ao remover da biblioteca: ${erro.message}`);
    } finally {
      setAdicionandoBiblioteca(false);
    }
  };

  const jaNoCarrinho = jogo && cartItems.some(item => item.jogo.id === jogo.id);

  const handleComprarJogo = () => {
    if (jaNoCarrinho) return;
    adicionarAoCarrinho(jogo);
    alert(`"${jogo.titulo}" foi adicionado ao seu carrinho!`);
  };

  if (carregando) {
    return <div className="text-center text-[#8f98a0] py-20 animate-pulse text-lg">Buscando ficha técnica...</div>;
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

  if (!jogo) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <button 
        onClick={() => navigate('/')} 
        className="text-[#8f98a0] hover:text-[#66c0f4] bg-transparent border-none cursor-pointer mb-6 text-sm flex items-center gap-2 font-medium transition-colors group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        VOLTAR PARA A LOJA
      </button>
      
      {/* HEADER PRINCIPAL DO JOGO */}
      <div className="bg-[#16202d]/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-[#2a475e]/50 shadow-[0_15px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-8 items-stretch mb-10">
        
        {/* IMAGEM DA CAPA */}
        <div className="w-full md:w-[400px] shrink-0 relative rounded-xl overflow-hidden shadow-2xl border border-[#2a475e]/30 group bg-[#0d121a] flex items-center justify-center">
          <img 
            src={jogo.capaUrl || IMAGEM_DEFAULT} 
            alt={jogo.titulo} 
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#10141d] via-transparent to-transparent opacity-80"></div>
        </div>

        {/* INFORMAÇÕES */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h2 className="text-white text-3xl md:text-4xl font-bold tracking-tight mb-2 drop-shadow-md break-words leading-tight">{jogo.titulo}</h2>
            
            <p className="text-[#8f98a0] text-sm mb-6 flex flex-wrap items-center gap-2">
              Desenvolvedora: <strong className="text-[#66c0f4] font-semibold tracking-wider uppercase bg-[#66c0f4]/10 px-2 py-0.5 rounded text-xs break-words">{jogo.desenvolvedora || 'Desconhecida'}</strong>
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {jogo.generos?.map((g) => (
                <span key={g.id} className="bg-[#2a475e]/50 backdrop-blur-sm text-[#b8cedf] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#2a475e] shadow-sm uppercase tracking-wider">
                  {g.nome}
                </span>
              ))}
            </div>

            <div className="mb-8">
                <span className="text-[#8f98a0] text-xs font-bold uppercase tracking-wider mb-2 block">Sobre o jogo</span>
                <p className="text-[#acb2b8] text-sm leading-relaxed bg-[#10141d]/60 p-5 rounded-xl border border-[#2a475e]/30 shadow-inner break-words">
                  {jogo.descricao || 'Sem descrição disponível.'}
                </p>
            </div>
          </div>

          <div className="mt-2 pt-5 border-t border-[#2a475e]/30">
            {/* Meta details */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-[#567086] font-mono mb-6 bg-[#10141d]/30 p-3 rounded-lg border border-[#2a475e]/20">
              <span className="flex items-center gap-2">
                 <svg className="w-4 h-4 text-[#8f98a0] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                 Lançamento: <strong className="text-[#b8cedf]">{jogo.lancamento ? new Date(jogo.lancamento).toLocaleDateString('pt-BR') : 'N/A'}</strong>
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#8f98a0] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Criado por: <strong className="text-[#b8cedf] break-words">{jogo.autor?.nome || 'Desconhecido'}</strong>
              </span>
            </div>
            
            {/* Buy Block */}
            <div className="flex flex-col sm:flex-row items-center bg-gradient-to-r from-[#10141d] to-[#16202d] rounded-xl border border-[#2a475e]/50 overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.3)] w-full">
                
                <div className="flex-1 px-6 py-4 flex flex-col items-center sm:items-start justify-center w-full sm:w-auto border-b sm:border-b-0 sm:border-r border-[#2a475e]/30 gap-1">
                    <span className="text-[#8f98a0] text-[10px] font-bold uppercase tracking-widest opacity-80">Preço:</span>
                    <span className="text-[#b8cedf] text-xl md:text-2xl font-bold tracking-wide drop-shadow-sm">
                        {jogo.preco > 0 ? `R$ ${jogo.preco.toFixed(2)}` : "Gratuito"}
                    </span>
                </div>
            
                <div className="flex flex-wrap sm:flex-nowrap gap-3 p-4 w-full sm:w-auto justify-end bg-[#16202d]/80 backdrop-blur-md">
                    <button 
                      onClick={handleComprarJogo}
                      disabled={jaNoCarrinho}
                      className={`flex-1 sm:flex-none px-8 py-3.5 rounded-lg text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 group transition-all duration-300 ${
                        jaNoCarrinho
                          ? 'bg-[#10141d] text-[#66c0f4] border border-[#66c0f4]/30 cursor-default opacity-90'
                          : 'bg-gradient-to-r from-[#1a7bcb] to-[#145e9b] hover:from-[#1e85dc] hover:to-[#176fa6] text-white shadow-[0_4px_15px_rgba(26,123,203,0.3)] hover:shadow-[0_0_20px_rgba(102,192,244,0.4)] cursor-pointer'
                      }`}
                    >
                      {jaNoCarrinho ? (
                        <>
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          No Carrinho
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                          Comprar
                        </>
                      )}
                    </button>

                    {naBiblioteca ? (
                      <button 
                        onClick={handleRemoverBiblioteca}
                        disabled={adicionandoBiblioteca}
                        className="flex-1 sm:flex-none bg-[#10141d] text-[#e05e5e] border border-[#e05e5e]/30 hover:bg-[#e05e5e]/10 px-6 py-3.5 rounded-lg text-sm font-bold transition-all tracking-wider uppercase disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Remover
                      </button>
                    ) : (
                      <button 
                        onClick={handleAdicionarBiblioteca}
                        disabled={adicionandoBiblioteca}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-[#2a475e] to-[#203648] text-[#66c0f4] border border-[#66c0f4]/30 hover:from-[#345975] hover:to-[#2a475e] px-6 py-3.5 rounded-lg text-sm font-bold shadow-md hover:shadow-[0_0_15px_rgba(102,192,244,0.2)] transition-all tracking-wider uppercase disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
                      >
                        <svg className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        Biblioteca
                      </button>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CONQUISTAS */}
        <div className="bg-[#16202d]/80 backdrop-blur-md p-8 rounded-2xl border border-[#2a475e]/40 shadow-xl flex flex-col max-h-[600px]">
          <h3 className="text-white font-bold text-xl border-b border-[#2a475e]/50 pb-4 mb-6 flex justify-between items-center tracking-wide uppercase">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-[#e2c144]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
              Conquistas
            </div>
            <span className="text-xs bg-[#2a475e]/80 text-[#66c0f4] px-3 py-1 rounded-full border border-[#66c0f4]/30 shadow-inner">
              {jogo.conquistas?.length || 0} Disponíveis
            </span>
          </h3>
          <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {jogo.conquistas && jogo.conquistas.length > 0 ? (
              jogo.conquistas.map((conquista) => (
                <div key={conquista.id} className="bg-[#10141d]/90 p-4 rounded-xl border border-[#2a475e]/30 flex flex-wrap sm:flex-nowrap justify-between items-start sm:items-center gap-4 hover:border-[#66c0f4]/40 transition-colors group">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 shrink-0 rounded bg-[#2a475e]/40 flex items-center justify-center border border-[#66c0f4]/20 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-[#b8cedf]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-white font-semibold text-sm group-hover:text-[#66c0f4] transition-colors break-words leading-tight">{conquista.titulo}</h4>
                        <p className="text-[#8f98a0] text-xs mt-1 break-words">{conquista.descricao}</p>
                    </div>
                  </div>
                  <span className="text-[#b5dc14] font-mono text-[10px] md:text-xs font-bold bg-[#4c6b22]/10 px-2.5 py-1.5 rounded border border-[#4c6b22]/30 shrink-0 shadow-inner whitespace-nowrap">
                    +{conquista.pontos} XP
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-[#567086] p-8 border border-dashed border-[#2a475e]/30 rounded-xl bg-[#10141d]/30">
                <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                <p className="text-sm font-medium">Nenhuma conquista cadastrada para este jogo.</p>
              </div>
            )}
          </div>
        </div>

        {/* ANÁLISES */}
        <div className="bg-[#16202d]/80 backdrop-blur-md p-8 rounded-2xl border border-[#2a475e]/40 shadow-xl flex flex-col max-h-[1000px]">
          <h3 className="text-white font-bold text-xl border-b border-[#2a475e]/50 pb-4 mb-6 flex justify-between items-center tracking-wide uppercase">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-[#66c0f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
              Análises de Usuários
            </div>
            <span className="text-xs bg-[#2a475e]/80 text-[#66c0f4] px-3 py-1 rounded-full border border-[#66c0f4]/30 shadow-inner">
              {reviews?.length ?? 0} Análises
            </span>
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-8">
              {/* FOMULÁRIO DE ANÁLISE */}
              <div className="bg-[#10141d]/80 p-6 rounded-xl border border-[#2a475e]/50 shadow-inner">
                <h3 className="text-[#b8cedf] font-bold text-sm border-b border-[#2a475e]/30 pb-3 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#66c0f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  Escrever Análise
                </h3>
                {estaAutenticado ? (
                  <form onSubmit={handleEnviarReview} className="flex flex-col gap-5">
                    <div className="text-[#8f98a0] text-xs font-mono">
                      Autenticado como: <span className="text-[#66c0f4] font-bold bg-[#66c0f4]/10 px-2 py-0.5 rounded ml-1">{usuario?.nome || 'Usuário'}</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                          <label className="text-[#8f98a0] text-[11px] uppercase tracking-wider font-bold">
                            Sua nota para o jogo
                          </label>
                          <span className="text-[#b8cedf] text-[10px] uppercase font-mono tracking-widest bg-[#10141d] px-3 py-1 rounded-md border border-[#2a475e]/40 shadow-inner">
                              {nota == 10 && '10 - Obra Prima'}
                              {nota == 8 && '8 - Muito Bom'}
                              {nota == 6 && '6 - Bom'}
                              {nota == 4 && '4 - Regular'}
                              {nota == 2 && '2 - Ruim'}
                              {nota == 0 && '0 - Péssimo'}
                          </span>
                      </div>
                      <div className="flex gap-2 bg-[#10141d]/50 p-1.5 rounded-lg border border-[#2a475e]/30">
                        {[0, 2, 4, 6, 8, 10].map((val) => (
                          <button
                            type="button"
                            key={val}
                            onClick={() => setNota(Number(val))}
                            className={`flex-1 py-2 rounded font-mono text-sm transition-all cursor-pointer border ${
                              nota == val 
                                ? 'bg-[#2a475e] text-white border-[#66c0f4]/40 shadow-md' 
                                : 'bg-transparent text-[#567086] border-transparent hover:bg-[#16202d] hover:text-[#8f98a0]'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[#567086] text-xs uppercase tracking-wider font-bold">
                        Você recomenda esse jogo?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRecomenda(true)}
                          className={`py-3 rounded-lg text-sm font-bold transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                          recomenda 
                            ? 'bg-gradient-to-r from-[#2a475e] to-[#203648] text-[#66c0f4] border-[#66c0f4]/40 shadow-[0_0_15px_rgba(102,192,244,0.15)]' 
                            : 'bg-[#16202d] text-[#567086] border-[#2a475e]/40 hover:text-[#b8cedf] hover:border-[#2a475e]'
                        }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                          Sim
                        </button>

                        <button
                          type="button"
                          onClick={() => setRecomenda(false)}
                          className={`py-3 rounded-lg text-sm font-bold transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                          !recomenda 
                            ? 'bg-gradient-to-r from-[#381a1a] to-[#2a1313] text-[#e05e5e] border-[#e05e5e]/40 shadow-[0_0_15px_rgba(224,94,94,0.15)]' 
                            : 'bg-[#16202d] text-[#567086] border-[#2a475e]/40 hover:text-[#b8cedf] hover:border-[#2a475e]'
                        }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"></path></svg>
                          Não
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[#567086] text-xs uppercase tracking-wider font-bold">
                          Deixe seu comentário
                        </label>
                        <textarea
                          value={comentarios}
                          onChange={(e) => setComentarios(e.target.value)}
                          placeholder='Descreva o que achou do jogo...'
                          className="w-full bg-[#16202d] border border-[#2a475e]/50 rounded-lg p-4 text-white text-sm focus:outline-none focus:border-[#66c0f4] focus:ring-1 focus:ring-[#66c0f4] transition-all resize-none min-h-[100px] leading-relaxed shadow-inner"
                        />
                    </div>

                    <button
                      type='submit'
                      disabled={enviandoReview}
                      className="w-full bg-gradient-to-r from-[#1a7bcb] to-[#145e9b] hover:from-[#1e85dc] hover:to-[#176fa6] text-white font-bold py-3.5 rounded-lg text-sm tracking-widest uppercase transition-all cursor-pointer shadow-[0_4px_15px_rgba(26,123,203,0.3)] hover:shadow-[0_0_20px_rgba(102,192,244,0.4)] disabled:opacity-50 mt-2"
                    >
                      {enviandoReview ? 'Enviando...' : 'Publicar Análise'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-8 px-4 bg-[#16202d]/50 border border-dashed border-[#2a475e]/50 rounded-xl flex flex-col gap-4 items-center">
                    <svg className="w-10 h-10 text-[#567086]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    <p className="text-sm text-[#8f98a0]">Você precisa estar conectado na sua conta para escrever uma análise.</p>
                    <Link to="/login" className="bg-gradient-to-r from-[#1a7bcb] to-[#145e9b] hover:from-[#1e85dc] hover:to-[#176fa6] text-white text-xs tracking-wider uppercase font-bold py-2.5 px-6 rounded-lg transition-all no-underline shadow-lg mt-2">
                      Iniciar Sessão
                    </Link>
                  </div>
                )}
              </div>

              {/* LISTA DE ANÁLISES */}
              <div className="flex flex-col gap-4">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-[#10141d]/60 p-5 rounded-xl border border-[#2a475e]/30 flex flex-col gap-3 hover:border-[#2a475e]/80 transition-colors">
                      <div className="flex justify-between items-start gap-4 flex-wrap sm:flex-nowrap">
                        <div className="flex flex-col min-w-0">
                            <span className="text-[#66c0f4] text-sm font-bold tracking-wide break-words">
                            {review.autor?.nome || `Usuário ${review.autorId}`}
                            </span>
                            <span className="text-[10px] text-[#567086] mt-0.5">Membro da Comunidade</span>
                        </div>
                        <span className={`text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 border shadow-sm shrink-0 whitespace-nowrap ${review.recomenda ? 'bg-[#2a475e]/20 text-[#66c0f4] border-[#66c0f4]/20' : 'bg-[#381a1a]/40 text-[#e05e5e] border-[#e05e5e]/20'}`}>
                          {review.recomenda ? (
                              <><svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg> Recomenda</>
                          ) : (
                              <><svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"></path></svg> Não Recomenda</>
                          )}
                        </span>
                      </div>
                      <p className="text-[#b8cedf] text-sm leading-relaxed bg-[#16202d] p-4 rounded-lg border border-[#2a475e]/20 shadow-inner break-words">
                        "{review.texto}"
                      </p>
                      <div className="flex justify-between items-center mt-1 border-t border-[#2a475e]/20 pt-3">
                        <span className="text-xs text-[#8f98a0] flex items-center gap-2">
                          Nota Final: <strong className={`font-mono text-sm px-2 py-0.5 rounded ${review.nota >= 7 ? 'text-[#66c0f4] bg-[#2a475e]/20' : review.nota >= 4 ? 'text-[#e2c144] bg-[#423d21]/20' : 'text-[#e05e5e] bg-[#381a1a]/40'}`}>{review.nota}/10</strong>
                        </span>
                        {estaAutenticado && usuario && review.autorId === usuario.id && (
                          <button 
                            onClick={() => handleDeletarReview(review.id)}
                            className="text-[#e05e5e]/80 hover:text-red-400 text-[10px] uppercase font-bold cursor-pointer flex items-center gap-1 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Deletar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 px-4 bg-[#10141d]/30 border border-dashed border-[#2a475e]/30 rounded-xl">
                      <p className="text-[#567086] text-sm font-medium">Nenhuma análise comunitária ainda.</p>
                  </div>
                )}
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}
