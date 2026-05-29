import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jogosService, reviewsService, bibliotecaService } from '../services/api';

const IMAGEM_DEFAULT = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=500&auto=format&fit=crop';

export default function DetalhesJogo() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { usuario, estaAutenticado } = useAuth();
  
  const [jogo, setJogo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [comentarios, setComentarios] = useState('');
  const [recomenda, setRecomenda] = useState(true);
  const [nota, setNota] = useState(10);
  const [enviandoReview, setEnviandoReview] = useState(false);
  const [adicionandoBiblioteca, setAdicionandoBiblioteca] = useState(false);

  useEffect(() => {
    carregarJogo();
  }, [id]); 

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

  const handleAdicionarBiblioteca = async () => {
    if (!estaAutenticado) {
      navigate('/login');
      return;
    }

    try {
      setAdicionandoBiblioteca(true);
      await bibliotecaService.adicionar(parseInt(id));
      alert(`"${jogo.titulo}" foi adicionado à sua biblioteca!`);
    } catch (erro) {
      alert(`Erro ao adicionar à biblioteca: ${erro.message}`);
    } finally {
      setAdicionandoBiblioteca(false);
    }
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
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <button 
        onClick={() => navigate('/')} 
        className="text-[#66c0f4] hover:underline bg-none border-none cursor-pointer mb-6 text-sm flex items-center gap-1 font-medium transition-colors"
      >
        ← Voltar para a Vitrine
      </button>
      
      <div className="bg-[#16202d] p-6 md:p-8 rounded border border-[#2a475e]/30 shadow-2xl flex flex-col md:flex-row gap-8 items-stretch mb-8">
        
        <div className="w-full md:w-[380px] bg-[#10141d] rounded p-4 flex items-center justify-center border border-[#2a475e]/10">
          <img 
            src={jogo.capaUrl || IMAGEM_DEFAULT} 
            alt={jogo.titulo} 
            className="max-w-full max-h-[300px] object-contain rounded" 
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = IMAGEM_DEFAULT;
            }}
          />
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h2 className="text-white text-3xl font-light tracking-wide mb-2">{jogo.titulo}</h2>
            
            <p className="text-[#8f98a0] text-xs mb-4">
              Desenvolvedora: <strong className="text-[#66c0f4] font-semibold uppercase">{jogo.desenvolvedora || 'Desconhecida'}</strong>
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {jogo.generos?.map((g) => (
                <span key={g.id} className="bg-[#2a475e]/40 text-[#66c0f4] text-xs font-semibold px-2.5 py-1 rounded-sm border border-[#66c0f4]/20">
                  {g.nome}
                </span>
              ))}
            </div>

            <p className="text-[#8f98a0] text-sm leading-relaxed mb-6">
              Descrição: <span className="text-[#acb2b8] block mt-1 bg-[#10141d]/50 p-4 rounded border border-[#2a475e]/10">{jogo.descricao || 'Sem descrição disponível.'}</span>
            </p>
          </div>

          <div className="border-t border-[#2a475e]/20 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-xs text-[#567086] flex flex-col gap-0.5">
              <span>Lançamento: <strong className="text-[#8f98a0]">{jogo.lancamento ? new Date(jogo.lancamento).toLocaleDateString('pt-BR') : 'N/A'}</strong></span>
              <span>Criado por: <strong className="text-[#8f98a0]">{jogo.autor?.nome || 'Desconhecido'}</strong></span>
            </div>
            
            <div className="flex items-center bg-[#10141d] p-2 rounded border border-[#2a475e]/20 gap-4 w-full sm:w-auto justify-between sm:justify-start">
                <div className="text-white text-2xl font-bold tracking-tight px-2">
                    {jogo.preco > 0 ? `R$ ${jogo.preco.toFixed(2)}` : "Gratuito"}
                </div>
            
                <button 
                  onClick={handleAdicionarBiblioteca}
                  disabled={adicionandoBiblioteca}
                  className="bg-gradient-to-r from-[#75b022] to-[#588a1b] text-white hover:from-[#8ed129] hover:to-[#6a9f21] px-5 py-2.5 rounded-sm text-sm font-bold shadow-lg transition-all cursor-pointer active:scale-98 tracking-wide uppercase disabled:opacity-50"
                >
                  {adicionandoBiblioteca ? 'Adicionando...' : 'Adicionar à Biblioteca'}
                </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="bg-[#16202d] p-6 rounded border border-[#2a475e]/20 shadow-xl">
          <h3 className="text-white font-medium text-lg border-b border-[#2a475e]/30 pb-2 mb-4 flex justify-between items-center">
            🏆 Conquistas Disponíveis
            <span className="text-xs bg-[#2a475e] text-[#66c0f4] px-2 py-0.5 rounded-full">
              {jogo.conquistas?.length || 0}
            </span>
          </h3>
          <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
            {jogo.conquistas && jogo.conquistas.length > 0 ? (
              jogo.conquistas.map((conquista) => (
                <div key={conquista.id} className="bg-[#10141d] p-3 rounded border border-[#2a475e]/10 flex justify-between items-center gap-4">
                  <div>
                    <h4 className="text-[#b8cedf] font-medium text-sm">{conquista.titulo}</h4>
                    <p className="text-[#567086] text-xs mt-0.5">{conquista.descricao}</p>
                  </div>
                  <span className="text-[#b5dc14] font-mono text-xs font-bold bg-[#4c6b22]/20 px-2 py-1 rounded border border-[#4c6b22]/30 shrink-0">
                    +{conquista.pontos} XP
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[#567086] text-sm italic">Nenhuma conquista cadastrada para este jogo.</p>
            )}
          </div>
        </div>

        <div className="bg-pink-500/10 p-6 rounded border border-pink-500/30 shadow-xl">
          <h3 className="text-white font-medium text-lg border-b border-pink-500/20 pb-2 mb-4 flex justify-between items-center">
            💬 Análises de Usuários
            <span className="text-xs bg-[#2a475e] text-[#66c0f4] px-2 py-0.5 rounded-full">
              {reviews?.length ?? 0}
            </span>
          </h3>
          <div className="md:col-span-1 bg-pink-500/10 p-5 rounded border border-pink-500/30 shadow-xl flex flex-col gap-4">
            <h3 className="text-white font-medium text-base border-b border-pink-500/20 pb-2 uppercase tracking-wide font-mono">
              Sua Análise
            </h3>
            {estaAutenticado ? (
              <form onSubmit={handleEnviarReview} className="flex flex-col gap-4">
                <div className="text-[#8f98a0] text-xs">
                  Olá, <span className="text-[#66c0f4] font-semibold">{usuario?.nome || 'Usuário'}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#8f98a0] text-[11px] uppercase tracking-wider font-mono">
                    Sua nota para o jogo
                  </label>

                  <select
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    className="bg-pink-500/5 border border-pink-500/30 rounded p-2 text-white text-xs focus:outline-none focus:border-pink-400 transition-colors"
                  >
                    <option value={10}>10 - Excelente</option>
                    <option value={8}>8 - Muito Bom</option>
                    <option value={6}>6 - Bom</option>
                    <option value={4}>4 - Regular</option>
                    <option value={2}>2 - Ruim</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#8f98a0] text-[11px] uppercase tracking-wider font-mono">
                    Você recomenda esse jogo?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRecomenda(true)}
                      className={`py-2 rounded-sm text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                      recomenda 
                        ? 'bg-[#4c6b22] text-[#b5dc14] border-[#b5dc14]/40 shadow-md' 
                        : 'bg-[#10141d] text-[#567086] border-[#2a475e]/40 hover:text-white'
                    }`}
                    >
                      👍 Sim
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecomenda(false)}
                      className={`py-2 rounded-sm text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                      !recomenda 
                        ? 'bg-[#a32e2e] text-[#ff8585] border-[#ff8585]/40 shadow-md' 
                        : 'bg-[#10141d] text-[#567086] border-[#2a475e]/40 hover:text-white'
                    }`}
                    >
                      👎 Não
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[#8f98a0] text-[11px] uppercase tracking-wider font-mono">
                      Deixe seu comentário
                    </label>

                    <textarea
                      value={comentarios}
                      onChange={(e) => setComentarios(e.target.value)}
                      placeholder='Descreva o que achou do jogo'
                      className="w-full bg-pink-500/5 border border-pink-500/30 rounded p-3 text-white text-xs focus:outline-none focus:border-pink-400 transition-colors resize-none font-sans leading-relaxed"
                    />
                </div>

                <button
                  type='submit'
                  disabled={enviandoReview}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 rounded-sm text-xs tracking-wider uppercase transition-colors cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {enviandoReview ? 'Enviando...' : 'Publicar Análise'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 px-4 bg-pink-500/5 border border-dashed border-pink-500/30 rounded flex flex-col gap-3">
                <p className="text-xs text-[#8f98a0] mb-2">Você precisa estar conectado na sua conta para escrever uma análise.</p>
                <Link to="/login" className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold py-2 px-5 rounded-sm transition-colors no-underline shadow-md">
                  Iniciar Sessão
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1 mt-6">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-pink-500/5 p-4 rounded border border-pink-500/20 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#66c0f4] text-xs font-semibold uppercase tracking-wider truncate max-w-[200px]">
                      {review.autor?.nome || `Usuário ${review.autorId}`}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${review.recomenda ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {review.recomenda ? '👍 Recomenda' : '👎 Não Recomenda'}
                    </span>
                  </div>
                  <p className="text-[#acb2b8] text-xs italic leading-relaxed bg-pink-500/10 p-2.5 rounded border border-pink-500/20">
                    "{review.texto}"
                  </p>
                  <span className="text-[10px] text-[#567086] text-right">
                    Nota: <strong className="text-[#b5dc14] font-mono">{review.nota}/10</strong>
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[#567086] text-sm italic">Nenhuma análise escrita ainda. Seja o primeiro!</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
