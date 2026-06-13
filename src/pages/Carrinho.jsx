import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { bibliotecaService } from '../services/api';

const IMAGEM_DEFAULT = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=500&auto=format&fit=crop';

export default function Carrinho() {
  const navigate = useNavigate();
  const { cartItems, valorTotal, removerDoCarrinho, atualizarQuantidade, limparCarrinho } = useCart();
  const { estaAutenticado } = useAuth();
  const [comprando, setComprando] = React.useState(false);

  const handleFinalizarCompra = async () => {
    if (cartItems.length === 0) return;
    
    if (!estaAutenticado) {
      alert('Você precisa fazer login para finalizar a compra.');
      navigate('/login');
      return;
    }

    try {
      setComprando(true);
      // Salvar os itens na biblioteca usando a API
      const promessas = cartItems.map(item => bibliotecaService.adicionar(item.jogo.id));
      await Promise.allSettled(promessas);

      alert('Compra feita com sucesso!');
      limparCarrinho();
      navigate('/');
    } catch (err) {
      alert('Houve um erro ao processar sua compra.');
    } finally {
      setComprando(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-[#8f98a0] hover:text-[#66c0f4] bg-transparent border-none cursor-pointer mb-6 text-sm flex items-center gap-2 font-medium transition-colors group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          CONTINUAR COMPRANDO
        </button>
      </div>

      <h1 className="text-white text-3xl font-light tracking-wide uppercase mb-8">Seu Carrinho</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 px-6 border border-[#2a475e]/30 bg-[#16202d]/80 backdrop-blur-md rounded-2xl max-w-xl mx-auto shadow-xl">
           <svg className="w-16 h-16 mx-auto text-[#567086] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
           <p className="text-[#b8cedf] text-lg font-medium">Seu carrinho está vazio.</p>
           <p className="text-sm text-[#8f98a0] mt-2">Adicione jogos incríveis para finalizar a compra.</p>
           <button onClick={() => navigate('/')} className="mt-6 bg-gradient-to-r from-[#1a7bcb] to-[#145e9b] text-white hover:from-[#1e85dc] hover:to-[#176fa6] px-6 py-2.5 rounded-lg text-xs font-bold shadow-md hover:shadow-[0_0_15px_rgba(102,192,244,0.4)] transition-all cursor-pointer tracking-wide uppercase border border-[#145e9b]/30 mx-auto block">
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Lista de Itens */}
          <div className="flex-1 flex flex-col gap-4">
            {cartItems.map((item) => (
              <div key={item.jogo.id} className="bg-[#10141d]/80 backdrop-blur-md p-4 rounded-xl border border-[#2a475e]/40 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-lg hover:border-[#66c0f4]/40 transition-colors w-full max-w-full overflow-hidden">
                <div className="w-24 sm:w-32 h-16 sm:h-20 shrink bg-[#0d121a] rounded overflow-hidden flex items-center justify-center border border-[#2a475e]/30 max-w-full">
                  <img 
                    src={item.jogo.capaUrl || IMAGEM_DEFAULT} 
                    alt={item.jogo.titulo} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = IMAGEM_DEFAULT;
                    }}
                  />
                </div>
                
                <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left w-full min-w-0">
                  <h3 className="text-white text-base sm:text-lg font-bold tracking-wide mb-1 truncate w-full">{item.jogo.titulo}</h3>
                  <span className="text-[#8f98a0] text-xs font-mono">
                    {item.jogo.preco > 0 ? `R$ ${item.jogo.preco.toFixed(2)} unitário` : 'Gratuito'}
                  </span>
                </div>
 
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto justify-center sm:justify-start">
                  <div className="flex items-center bg-[#16202d] rounded-lg border border-[#2a475e]/50 overflow-hidden shadow-inner">
                    <button 
                      onClick={() => atualizarQuantidade(item.jogo.id, item.quantidade - 1)}
                      className="px-3 py-1.5 hover:bg-[#2a475e] text-[#66c0f4] transition-colors font-bold cursor-pointer disabled:opacity-50"
                      disabled={item.quantidade <= 1}
                    >
                      -
                    </button>
                    <span className="text-white w-8 text-center text-sm font-bold">{item.quantidade}</span>
                    <button 
                      onClick={() => atualizarQuantidade(item.jogo.id, item.quantidade + 1)}
                      className="px-3 py-1.5 hover:bg-[#2a475e] text-[#66c0f4] transition-colors font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="w-auto sm:w-24 text-center sm:text-right">
                    <strong className="text-[#b8cedf] text-base sm:text-lg font-bold">
                      {item.jogo.preco > 0 ? `R$ ${(item.jogo.preco * item.quantidade).toFixed(2)}` : 'Gratuito'}
                    </strong>
                  </div>
 
                  <button 
                    onClick={() => removerDoCarrinho(item.jogo.id)}
                    className="text-[#e05e5e] hover:text-white bg-transparent hover:bg-[#e05e5e]/20 p-2 rounded transition-all cursor-pointer border border-transparent hover:border-[#e05e5e]/30"
                    title="Remover item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo da Compra */}
          <div className="w-full lg:w-80 bg-[#16202d]/90 backdrop-blur-md p-6 rounded-xl border border-[#2a475e]/50 shadow-2xl sticky top-24">
            <h2 className="text-white text-xl font-bold mb-6 tracking-wide uppercase border-b border-[#2a475e]/30 pb-4">Resumo</h2>
            
            <div className="flex justify-between items-center mb-6 bg-[#10141d]/50 p-4 rounded-lg border border-[#2a475e]/30">
              <span className="text-[#8f98a0] text-xs font-bold uppercase tracking-wider">Total a Pagar</span>
              <span className="text-white text-2xl font-black drop-shadow-md">R$ {valorTotal.toFixed(2)}</span>
            </div>

            <button 
              onClick={handleFinalizarCompra}
              disabled={comprando}
              className="w-full bg-gradient-to-r from-[#1a7bcb] to-[#145e9b] hover:from-[#1e85dc] hover:to-[#176fa6] text-white py-3.5 rounded-lg text-sm font-bold shadow-[0_4px_15px_rgba(26,123,203,0.3)] hover:shadow-[0_0_20px_rgba(102,192,244,0.4)] transition-all cursor-pointer uppercase tracking-widest disabled:opacity-50"
            >
              {comprando ? 'Processando...' : 'Finalizar Compra'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
