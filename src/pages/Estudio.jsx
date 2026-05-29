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
    preco: 0,
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
      preco: 0,
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
      [name]: type === 'number' ? Number(value) : value
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
        lancamento: formData.lancamento ? new Date(formData.lancamento).toISOString() : new Date().toISOString()
      };

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
      <div className="mb-8 flex justify-between items-end">
        <div>
          <button
            onClick={() => navigate('/')}
            className="text-[#66c0f4] hover:underline bg-none border-none cursor-pointer mb-6 text-sm flex items-center gap-1 font-medium transition-colors"
          >
            ← Voltar para a Vitrine
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
          className="bg-[#66c0f4] text-[#171a21] px-5 py-2.5 rounded font-bold hover:bg-[#86d4ff] transition-colors shadow-lg cursor-pointer flex gap-2 items-center"
        >
          <span>+</span> Novo Jogo
        </button>
      </div>

      {erro && (
        <div className="text-center text-red-400 py-10 px-6 border border-red-500/20 bg-red-500/5 rounded-md max-w-xl mx-auto my-10">
          <p className="font-semibold">Erro ao carregar dados.</p>
          <p className="text-sm text-red-400/70 mt-1">{erro}</p>
        </div>
      )}

      {!erro && jogos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jogos.map(jogo => (
            <div key={jogo.id} className="bg-[#10141d] border border-[#2a475e]/30 rounded overflow-hidden shadow-lg flex flex-col">
              <img 
                src={jogo.capaUrl || IMAGEM_DEFAULT} 
                alt={jogo.titulo} 
                className="w-full h-40 object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = IMAGEM_DEFAULT; }}
              />
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-white font-medium text-lg mb-1 truncate">{jogo.titulo}</h3>
                  <p className="text-[#567086] text-xs mb-3 truncate">
                    {jogo.generos?.map(g => g.nome).join(', ') || 'Sem gênero'}
                  </p>
                  <p className="text-[#b8cedf] font-bold text-sm mb-4">
                    {jogo.preco > 0 ? `R$ ${jogo.preco.toFixed(2)}` : 'Gratuito'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => abrirModalEditar(jogo)}
                    className="flex-1 bg-[#2a475e] text-white py-1.5 rounded text-xs font-bold hover:bg-[#345975] transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeletar(jogo.id)}
                    className="flex-1 bg-red-500/20 text-red-400 py-1.5 rounded text-xs font-bold border border-red-500/30 hover:bg-red-500/30 transition-colors cursor-pointer"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !erro && (
          <div className="text-center py-20 px-6 border border-[#2a475e]/30 bg-[#10141d]/50 rounded-md max-w-xl mx-auto">
            <p className="text-[#8f98a0] font-semibold">Você ainda não publicou nenhum jogo.</p>
            <button 
              onClick={abrirModalCriar} 
              className="mt-4 text-sm bg-[#66c0f4] text-[#171a21] px-4 py-2 rounded font-bold hover:bg-[#86d4ff] cursor-pointer"
            >
              Publicar meu primeiro jogo
            </button>
          </div>
        )
      )}

      {/* Modal Criar/Editar */}
      {exibirModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#171a21] border border-[#2a475e] rounded-lg p-6 w-full max-w-2xl shadow-2xl relative my-8">
            <h2 className="text-white text-2xl font-light mb-6 uppercase tracking-wide">
              {jogoEditando ? 'Editar Jogo' : 'Publicar Novo Jogo'}
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[#acb2b8] text-xs font-semibold uppercase tracking-wider">Título do Jogo *</label>
                  <input 
                    required
                    type="text" 
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    className="bg-[#10141d] text-white border border-[#2a475e]/50 p-2 rounded focus:outline-none focus:border-[#66c0f4]"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[#acb2b8] text-xs font-semibold uppercase tracking-wider">Desenvolvedora *</label>
                  <input 
                    required
                    type="text" 
                    name="desenvolvedora"
                    value={formData.desenvolvedora}
                    onChange={handleInputChange}
                    className="bg-[#10141d] text-white border border-[#2a475e]/50 p-2 rounded focus:outline-none focus:border-[#66c0f4]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#acb2b8] text-xs font-semibold uppercase tracking-wider">URL da Capa</label>
                <input 
                  type="url" 
                  name="capaUrl"
                  value={formData.capaUrl}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="bg-[#10141d] text-white border border-[#2a475e]/50 p-2 rounded focus:outline-none focus:border-[#66c0f4]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[#acb2b8] text-xs font-semibold uppercase tracking-wider">Preço (R$) *</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    min="0"
                    name="preco"
                    value={formData.preco}
                    onChange={handleInputChange}
                    className="bg-[#10141d] text-white border border-[#2a475e]/50 p-2 rounded focus:outline-none focus:border-[#66c0f4]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#acb2b8] text-xs font-semibold uppercase tracking-wider">Lançamento *</label>
                  <input 
                    required
                    type="date" 
                    name="lancamento"
                    value={formData.lancamento}
                    onChange={handleInputChange}
                    className="bg-[#10141d] text-white border border-[#2a475e]/50 p-2 rounded focus:outline-none focus:border-[#66c0f4] [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#acb2b8] text-xs font-semibold uppercase tracking-wider">Descrição *</label>
                <textarea 
                  required
                  rows="3"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  className="bg-[#10141d] text-white border border-[#2a475e]/50 p-2 rounded focus:outline-none focus:border-[#66c0f4] resize-y"
                />
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[#acb2b8] text-xs font-semibold uppercase tracking-wider">Gêneros (Selecione)</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-[#10141d] rounded border border-[#2a475e]/50">
                  {generosOptions.map(g => (
                    <label key={g.id} className="flex items-center gap-1.5 text-sm text-[#b8cedf] cursor-pointer hover:text-white bg-[#171a21] px-2 py-1 rounded">
                      <input 
                        type="checkbox"
                        checked={formData.generoIds.includes(g.id)}
                        onChange={() => handleGeneroToggle(g.id)}
                        className="accent-[#66c0f4] cursor-pointer"
                      />
                      {g.nome}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#2a475e]/40">
                <button 
                  type="button"
                  onClick={fecharModal}
                  className="px-5 py-2 rounded text-sm font-bold text-[#b8cedf] hover:text-white hover:bg-[#2a475e]/50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={salvando}
                  className="bg-[#66c0f4] text-[#171a21] px-6 py-2 rounded font-bold hover:bg-[#86d4ff] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
