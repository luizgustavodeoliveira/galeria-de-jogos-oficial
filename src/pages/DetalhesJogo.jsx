import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


const API_URL = 'https://alunos-ads-api-production.up.railway.app'; 
const IMAGEM_DEFAULT = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=500&auto=format&fit=crop';

export default function DetalhesJogo() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [jogo, setJogo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    setCarregando(true);
    fetch(`${API_URL}/jogos/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Este jogo não foi localizado no servidor.');
        return res.json();
      })
      .then((data) => {
        setJogo(data);
        setCarregando(false);
      })
      .catch((err) => {
        setErro(err.message);
        setCarregando(false);
      });
  }, [id]); 

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
              Desenvolvedora: <strong className="text-[#66c0f4] font-semibold uppercase">{jogo.desenvolvedora}</strong>
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {jogo.generos?.map((g) => (
                <span key={g.id} className="bg-[#2a475e]/40 text-[#66c0f4] text-xs font-semibold px-2.5 py-1 rounded-sm border border-[#66c0f4]/20">
                  {g.nome}
                </span>
              ))}
            </div>

            <p className="text-[#8f98a0] text-sm leading-relaxed mb-6">
              Descrição: <span className="text-[#acb2b8] block mt-1 bg-[#10141d]/50 p-4 rounded border border-[#2a475e]/10">{jogo.descricao}</span>
            </p>
          </div>

          <div className="border-t border-[#2a475e]/20 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-xs text-[#567086] flex flex-col gap-0.5">
              <span>Lançamento: <strong className="text-[#8f98a0]">{jogo.lancamento ? new Date(jogo.lancamento).toLocaleDateString('pt-BR') : 'N/A'}</strong></span>
              <span>Criado por: <strong className="text-[#8f98a0]">{jogo.autor?.nome}</strong></span>
            </div>
            
            <div className="flex items-center bg-[#10141d] p-2 rounded border border-[#2a475e]/20 gap-4 w-full sm:w-auto justify-between sm:justify-start">
                <div className="text-white text-2xl font-bold tracking-tight px-2">
                    {jogo.preco > 0 ? `R$ ${jogo.preco.toFixed(2)}` : "Gratuito"}
                </div>
            
                <button 
                onClick={() => alert(`Jogo "${jogo.titulo}" adicionado ao carrinho! (Funcionalidade para o próximo Checkpoint)`)}
                className="bg-gradient-to-r from-[#75b022] to-[#588a1b] text-white hover:from-[#8ed129] hover:to-[#6a9f21] px-5 py-2.5 rounded-sm text-sm font-bold shadow-lg transition-all cursor-pointer active:scale-98 tracking-wide uppercase"
                >
                Comprar
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

        <div className="bg-[#16202d] p-6 rounded border border-[#2a475e]/20 shadow-xl">
          <h3 className="text-white font-medium text-lg border-b border-[#2a475e]/30 pb-2 mb-4 flex justify-between items-center">
            💬 Análises de Usuários
            <span className="text-xs bg-[#2a475e] text-[#66c0f4] px-2 py-0.5 rounded-full">
              {jogo._count?.reviews ?? jogo.reviews?.length ?? 0}
            </span>
          </h3>
          <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
            {jogo.reviews && jogo.reviews.length > 0 ? (
              jogo.reviews.map((review) => (
                <div key={review.id} className="bg-[#10141d] p-4 rounded border border-[#2a475e]/10 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#66c0f4] text-xs font-semibold uppercase tracking-wider truncate max-w-[200px]">
                      {review.autor?.nome}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${review.recomenda ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {review.recomenda ? '👍 Recomenda' : '👎 Não Recomenda'}
                    </span>
                  </div>
                  <p className="text-[#acb2b8] text-xs italic leading-relaxed bg-[#171a21]/50 p-2.5 rounded border border-[#2a475e]/5">
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