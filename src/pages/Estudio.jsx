import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jogosService, generosService } from '../services/api';

const IMAGEM_DEFAULT = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=500&auto=format&fit=crop';

export default function Estudio() {
  const navigate = useNavigate();
  const { usuario, estaAutenticado, token } = useAuth();

  const [jogos, setJogos] = useState([]);
  const [generosOptions, setGenerosOptions] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Estados do formulário / modal
  const [exibirModal, setExibirModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [jogoEditando, setJogoEditando] = useState(null);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    preco: '',
    desenvolvedora: '',
    capaUrl: '',
    lancamento: new Date().toISOString().split('T')[0],
    generoIds: []
  });

  useEffect(() => {
    if (!token && !estaAutenticado) {
      navigate('/login');
      return;
    }
    if (estaAutenticado) {
      carregarDados();
    }
  }, [estaAutenticado, token, navigate]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro(null);

      // Busca gêneros
      const gens = await generosService.listar();
      setGenerosOptions(gens || []);

      // Busca todos os jogos e filtra pelo autor logado
      // Usamos o limite máximo permitido pela API (100) para trazer a maior quantidade possível
      const response = await jogosService.listar(1, 100);
      const todosJogos = response.itens || response || [];

      const meusJogos = todosJogos.filter(j => j.autor && j.autor.id === usuario.id);
      setJogos(meusJogos);

    } catch (err) {
      setErro(err.message || 'Erro ao carregar seu estúdio.');
    } finally {
      setCarregando(false);
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este jogo? Ele será removido da loja!')) return;
    try {
      await jogosService.deletar(id);
      setJogos(prev => prev.filter(j => j.id !== id));
      alert('Jogo excluído com sucesso!');
    } catch (err) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  const abrirModalCriar = () => {
    setJogoEditando(null);
    setFormData({
      titulo: '',
      descricao: '',
      preco: '',
      desenvolvedora: '',
      capaUrl: '',
      lancamento: new Date().toISOString().split('T')[0],
      generoIds: []
    });
    setExibirModal(true);
  };

  const abrirModalEditar = (jogo) => {
    setJogoEditando(jogo);
    setFormData({
      titulo: jogo.titulo || '',
      descricao: jogo.descricao || '',
      preco: jogo.preco || 0,
      desenvolvedora: jogo.desenvolvedora || '',
      capaUrl: jogo.capaUrl || '',
      lancamento: jogo.lancamento ? jogo.lancamento.split('T')[0] : '',
      generoIds: (jogo.generos || []).map(g => g.id)
    });
    setExibirModal(true);
  };

  const fecharModal = () => {
    setExibirModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleGeneroToggle = (id) => {
    setFormData(prev => {
      const isSelected = prev.generoIds.includes(id);
      return {
        ...prev,
        generoIds: isSelected
          ? prev.generoIds.filter(gId => gId !== id)
          : [...prev.generoIds, id]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);

      const payload = {
        ...formData,
        preco: formData.preco === '' ? 0 : Number(formData.preco),
        lancamento: formData.lancamento ? new Date(formData.lancamento).toISOString() : new Date().toISOString()
      };

      if (!payload.capaUrl || payload.capaUrl.trim() === '') {
        delete payload.capaUrl;
      }

      if (jogoEditando) {
        await jogosService.atualizar(jogoEditando.id, payload);
        alert('Jogo atualizado com sucesso!');
      } else {
        await jogosService.criar(payload);
        alert('Jogo publicado com sucesso!');
      }

      fecharModal();
      carregarDados();
    } catch (err) {
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <div className="text-center text-[#8f98a0] py-20 animate-pulse text-lg">Carregando estúdio...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 relative">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <button
            onClick={() => navigate('/')}
            className="text-[#8f98a0] hover:text-[#66c0f4] bg-transparent border-none cursor-pointer mb-6 text-sm flex items-center gap-2 font-medium transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            VOLTAR PARA A LOJA
          </button>

          <h1 className="text-white font-light text-3xl tracking-wide uppercase">
            Meu Estúdio
          </h1>
          <p className="text-[#8f98a0] text-sm mt-2">
            Gerencie os jogos que você desenvolveu e publicou na plataforma.
          </p>
        </div>

        <button
          onClick={abrirModalCriar}
          className="bg-gradient-to-r from-[#1a7bcb] to-[#145e9b] text-white hover:from-[#1e85dc] hover:to-[#176fa6] px-6 py-3 rounded-lg text-sm font-bold shadow-[0_4px_15px_rgba(26,123,203,0.3)] hover:shadow-[0_0_20px_rgba(102,192,244,0.4)] transition-all cursor-pointer flex gap-2 items-center tracking-wider uppercase"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Novo Jogo
        </button>
      </div>

      {erro && (
        <div className="text-center text-red-400 py-10 px-6 border border-red-500/20 bg-red-500/5 rounded-md max-w-xl mx-auto my-10">
          <p className="font-semibold">Erro ao carregar dados.</p>
          <p className="text-sm text-red-400/70 mt-1">{erro}</p>
        </div>
      )}

      {!erro && jogos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {jogos.map(jogo => (
            <div key={jogo.id} className="group bg-[#16202d]/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#2a475e]/50 transition-all duration-400 hover:border-[#66c0f4]/60 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(102,192,244,0.12)] flex flex-col shadow-lg">
              <div className="w-full h-44 relative overflow-hidden bg-[#0d121a] flex items-center justify-center border-b border-[#2a475e]/30">
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
                  onError={(e) => { e.target.onerror = null; e.target.src = IMAGEM_DEFAULT; }}
                />
                <div className="absolute top-3 right-3 bg-[#10141d]/90 backdrop-blur-md px-2.5 py-1 rounded border border-[#2a475e]/80 shadow-md">
                   <span className="text-[#b8cedf] font-bold text-[12px] tracking-wide">{jogo.preco > 0 ? `R$ ${jogo.preco.toFixed(2)}` : 'Gratuito'}</span>
                </div>
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between">
                <div className="mb-5">
                  <h3 className="text-white font-bold text-[18px] mb-1 truncate group-hover:text-[#66c0f4] transition-colors tracking-wide drop-shadow-sm">{jogo.titulo}</h3>
                  <p className="text-[#66c0f4] text-[10px] font-bold tracking-wider uppercase truncate">
                    {jogo.generos?.map(g => g.nome).join(', ') || 'Sem gênero'}
                  </p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3">
                  <button
                    onClick={() => abrirModalEditar(jogo)}
                    className="flex-grow sm:flex-1 bg-gradient-to-r from-[#2a475e] to-[#203648] text-[#66c0f4] py-2 rounded-lg text-xs font-bold hover:from-[#345975] hover:to-[#2a475e] transition-all cursor-pointer border border-[#66c0f4]/30 shadow-md flex justify-center items-center gap-1.5 uppercase tracking-wide min-w-[80px]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeletar(jogo.id)}
                    className="flex-grow sm:flex-1 bg-[#10141d] text-[#e05e5e] border border-[#e05e5e]/30 hover:bg-[#e05e5e]/10 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md flex justify-center items-center gap-1.5 uppercase tracking-wide min-w-[80px]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !erro && (
          <div className="text-center py-20 px-6 border border-[#2a475e]/30 bg-[#16202d]/80 backdrop-blur-md rounded-2xl max-w-xl mx-auto shadow-xl">
             <svg className="w-16 h-16 mx-auto text-[#567086] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
             <p className="text-[#b8cedf] text-lg font-medium">Você ainda não publicou nenhum jogo.</p>
             <button
               onClick={abrirModalCriar}
               className="mt-6 bg-gradient-to-r from-[#1a7bcb] to-[#145e9b] text-white hover:from-[#1e85dc] hover:to-[#176fa6] px-6 py-2.5 rounded-lg text-xs font-bold shadow-md hover:shadow-[0_0_15px_rgba(102,192,244,0.4)] transition-all cursor-pointer tracking-wide uppercase border border-[#145e9b]/30 mx-auto block"
             >
               Publicar meu primeiro jogo
             </button>
          </div>
        )
      )}

      {/* Modal Criar/Editar */}
      {exibirModal && (
        <div className="fixed inset-0 bg-[#0d121a]/95 backdrop-blur-sm z-50 overflow-y-auto flex justify-center items-start p-4 sm:p-8">
          <div className="bg-[#16202d] border border-[#2a475e]/50 rounded-2xl p-6 sm:p-10 w-full max-w-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative my-auto">
            
            <button 
              onClick={fecharModal}
              className="absolute top-6 right-6 text-[#8f98a0] hover:text-[#e05e5e] transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <h2 className="text-white text-2xl font-bold mb-8 uppercase tracking-widest border-b border-[#2a475e]/40 pb-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-[#66c0f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              {jogoEditando ? 'Editar Jogo' : 'Publicar Novo Jogo'}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[#8f98a0] text-xs font-bold uppercase tracking-wider">Título do Jogo *</label>
                  <input
                    required
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    className="bg-[#10141d]/80 text-white border border-[#2a475e]/60 p-3 rounded-lg focus:outline-none focus:border-[#66c0f4] focus:ring-1 focus:ring-[#66c0f4] transition-all shadow-inner"
                    placeholder="Ex: Meu Jogo Incrível"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[#8f98a0] text-xs font-bold uppercase tracking-wider">Desenvolvedora *</label>
                  <input
                    required
                    type="text"
                    name="desenvolvedora"
                    value={formData.desenvolvedora}
                    onChange={handleInputChange}
                    className="bg-[#10141d]/80 text-white border border-[#2a475e]/60 p-3 rounded-lg focus:outline-none focus:border-[#66c0f4] focus:ring-1 focus:ring-[#66c0f4] transition-all shadow-inner"
                    placeholder="Sua Empresa"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#8f98a0] text-xs font-bold uppercase tracking-wider">URL da Capa</label>
                <input
                  type="url"
                  name="capaUrl"
                  value={formData.capaUrl}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="bg-[#10141d]/80 text-white border border-[#2a475e]/60 p-3 rounded-lg focus:outline-none focus:border-[#66c0f4] focus:ring-1 focus:ring-[#66c0f4] transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[#8f98a0] text-xs font-bold uppercase tracking-wider">Preço (R$) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    name="preco"
                    value={formData.preco}
                    onChange={handleInputChange}
                    className="bg-[#10141d]/80 text-white border border-[#2a475e]/60 p-3 rounded-lg focus:outline-none focus:border-[#66c0f4] focus:ring-1 focus:ring-[#66c0f4] transition-all shadow-inner font-mono text-lg"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#8f98a0] text-xs font-bold uppercase tracking-wider">Data de Lançamento *</label>
                  <input
                    required
                    type="date"
                    name="lancamento"
                    value={formData.lancamento}
                    onChange={handleInputChange}
                    className="bg-[#10141d]/80 text-white border border-[#2a475e]/60 p-3 rounded-lg focus:outline-none focus:border-[#66c0f4] focus:ring-1 focus:ring-[#66c0f4] transition-all shadow-inner [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#8f98a0] text-xs font-bold uppercase tracking-wider">Descrição *</label>
                <textarea
                  required
                  rows="4"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  placeholder="Conte um pouco sobre o jogo..."
                  className="bg-[#10141d]/80 text-white border border-[#2a475e]/60 p-3 rounded-lg focus:outline-none focus:border-[#66c0f4] focus:ring-1 focus:ring-[#66c0f4] transition-all shadow-inner resize-y leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <label className="text-[#8f98a0] text-xs font-bold uppercase tracking-wider">Gêneros (Selecione)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-4 bg-[#10141d]/80 rounded-lg border border-[#2a475e]/60 shadow-inner">
                  {generosOptions.map(g => {
                    const isChecked = formData.generoIds.includes(g.id);
                    return (
                      <label 
                        key={g.id} 
                        className={`flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded transition-colors ${isChecked ? 'bg-[#66c0f4]/20 text-white border border-[#66c0f4]/50' : 'bg-[#171a21] text-[#b8cedf] hover:bg-[#2a475e]/30 border border-transparent'}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleGeneroToggle(g.id)}
                          className="accent-[#66c0f4] cursor-pointer w-4 h-4"
                        />
                        <span className="truncate">{g.nome}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-[#2a475e]/40">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="px-6 py-3 rounded-lg text-sm font-bold text-[#b8cedf] hover:text-white hover:bg-[#2a475e]/50 transition-colors cursor-pointer border border-transparent hover:border-[#2a475e]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="bg-gradient-to-r from-[#1a7bcb] to-[#145e9b] text-white hover:from-[#1e85dc] hover:to-[#176fa6] px-8 py-3 rounded-lg text-sm font-bold shadow-[0_4px_15px_rgba(26,123,203,0.3)] hover:shadow-[0_0_20px_rgba(102,192,244,0.4)] transition-all cursor-pointer uppercase tracking-widest disabled:opacity-50"
                >
                  {salvando ? 'Salvando...' : 'Salvar Jogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
