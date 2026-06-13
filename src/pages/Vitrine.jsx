import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FiltroGeneros from '../components/FiltroGeneros';
import { jogosService, bibliotecaService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const IMAGEM_DEFAULT = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=500&auto=format&fit=crop';

function CarrosselVitrine({ jogos, meusJogosIds, navigate }) {
    const [activeIndex, setActiveIndex] = useState(1);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(true);
    
    // Estados para controle de swipe/drag
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchEndX, setTouchEndX] = useState(0);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [mouseStartX, setMouseStartX] = useState(0);

    const N = jogos.length;
    if (N === 0) return null;

    // Duplicamos o último no início e o primeiro no final para o efeito infinito suave
    const slides = [jogos[N - 1], ...jogos, jogos[0]];

    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            handleNext();
        }, 3000);
        return () => clearInterval(interval);
    }, [isPlaying, activeIndex]);

    const handleNext = () => {
        if (!isTransitioning) return;
        setActiveIndex((prev) => prev + 1);
    };

    const handlePrev = () => {
        if (!isTransitioning) return;
        setActiveIndex((prev) => prev - 1);
    };

    const handleTransitionEnd = () => {
        if (activeIndex === N + 1) {
            setIsTransitioning(false);
            setActiveIndex(1);
        } else if (activeIndex === 0) {
            setIsTransitioning(false);
            setActiveIndex(N);
        }
    };

    useEffect(() => {
        if (!isTransitioning) {
            const timer = setTimeout(() => {
                setIsTransitioning(true);
            }, 25);
            return () => clearTimeout(timer);
        }
    }, [isTransitioning]);

    // Handlers para Touch Devices (Swipe)
    const handleTouchStart = (e) => {
        setTouchStartX(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEndX(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStartX || !touchEndX) return;
        const diff = touchStartX - touchEndX;
        const threshold = 50; // pixels mínimos de arrasto
        if (diff > threshold) {
            handleNext();
            setIsPlaying(false); // Pausa ao interagir
        } else if (diff < -threshold) {
            handlePrev();
            setIsPlaying(false); // Pausa ao interagir
        }
        setTouchStartX(0);
        setTouchEndX(0);
    };

    // Handlers para Mouse (Arrastar no Desktop para teste)
    const handleMouseDown = (e) => {
        setIsMouseDown(true);
        setMouseStartX(e.clientX);
    };

    const handleMouseUp = (e) => {
        if (!isMouseDown) return;
        const diff = mouseStartX - e.clientX;
        const threshold = 50;
        if (diff > threshold) {
            handleNext();
            setIsPlaying(false); // Pausa ao interagir
        } else if (diff < -threshold) {
            handlePrev();
            setIsPlaying(false); // Pausa ao interagir
        }
        setIsMouseDown(false);
    };

    const handleMouseLeave = () => {
        setIsMouseDown(false);
    };

    return (
        <div className="w-full flex flex-col items-center select-none relative px-1">
            {/* Contêiner de slides com overflow hidden para ocultar barra de rolagem */}
            <div 
                className="w-full overflow-hidden rounded-2xl border border-[#2a475e]/60 bg-[#16202d]/90 backdrop-blur-md shadow-2xl relative flex flex-col cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                
                {/* Slides Track */}
                <div 
                    className="flex w-full"
                    style={{
                        transform: `translateX(-${activeIndex * 100}%)`,
                        transition: isTransitioning ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
                    }}
                    onTransitionEnd={handleTransitionEnd}
                >
                    {slides.map((jogo, index) => (
                        <div 
                            key={`${jogo.id}-${index}`} 
                            className="w-full shrink-0 flex flex-col cursor-pointer"
                            onClick={() => navigate(`/jogo/${jogo.id}`)}
                        >
                            <div className="w-full h-56 sm:h-64 relative overflow-hidden bg-[#0d121a] flex items-center justify-center">
                                <img 
                                    src={jogo.capaUrl || IMAGEM_DEFAULT}
                                    alt={jogo.titulo}
                                    className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
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
                                <div className="absolute inset-0 bg-gradient-to-t from-[#16202d] via-[#16202d]/25 to-transparent opacity-90"></div>
                                
                                <div className="absolute bottom-3 right-3 bg-[#16202d]/95 backdrop-blur-md px-2.5 py-1 rounded border border-[#2a475e]/80 shadow-md">
                                    <span className="text-[#b8cedf] font-bold text-[12px] tracking-wide">{`R$ ${jogo.preco?.toFixed(2) || '0,00'}`}</span>
                                </div>

                                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                                    {jogo.generos && jogo.generos.length > 0 && (
                                        <span className="bg-[#2a475e]/85 backdrop-blur-md text-[#b8cedf] text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-[#2a475e]/60">
                                            {jogo.generos[0].nome}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 flex-grow flex flex-col justify-start bg-[#16202d]/95">
                                <h3 className="text-white font-bold text-lg truncate mb-1 hover:text-[#66c0f4] transition-colors tracking-wide">{jogo.titulo}</h3>
                                <span className="text-[#66c0f4] text-[10px] font-bold tracking-wider uppercase mb-2 block">
                                    {jogo.desenvolvedora || "Desconhecido"}
                                </span>
                                <p className="text-[#acb2b8] text-[12px] leading-relaxed line-clamp-2">
                                    {jogo.descricao || "Nenhuma descrição disponível."}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Controles de Navegação e Pause */}
                <div className="flex items-center justify-center py-3 border-t border-[#2a475e]/30 bg-[#10141d]/80 gap-4 w-full">
                    <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="w-10 h-10 rounded-full border border-[#2a475e]/60 flex items-center justify-center text-[#b8cedf] hover:text-white hover:border-[#66c0f4]/80 hover:bg-[#2a475e]/30 transition-all cursor-pointer shrink-0"
                        style={{ width: '40px', height: '40px', minWidth: '40px', maxWidth: '40px', padding: '0' }}
                        aria-label="Jogo anterior"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                    </button>

                    <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                        className="px-5 py-2 rounded-full border border-[#66c0f4]/40 bg-[#2a475e]/40 hover:bg-[#66c0f4]/20 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md shrink-0"
                        style={{ height: '40px', padding: '0 20px', minWidth: '110px', maxWidth: '140px' }}
                        aria-label={isPlaying ? "Pausar carrossel" : "Iniciar carrossel"}
                    >
                        {isPlaying ? (
                            <>
                                <svg className="w-3.5 h-3.5 text-[#66c0f4] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" clipRule="evenodd" />
                                </svg>
                                Pause
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5 text-[#66c0f4] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M8 5v14l11-7z" clipRule="evenodd" />
                                </svg>
                                Play
                            </>
                        )}
                    </button>

                    <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="w-10 h-10 rounded-full border border-[#2a475e]/60 flex items-center justify-center text-[#b8cedf] hover:text-white hover:border-[#66c0f4]/80 hover:bg-[#2a475e]/30 transition-all cursor-pointer shrink-0"
                        style={{ width: '40px', height: '40px', minWidth: '40px', maxWidth: '40px', padding: '0' }}
                        aria-label="Próximo jogo"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
            </div>

            {/* Dots */}
            <div className="flex flex-wrap gap-2 mt-4 px-4 justify-center items-center w-full max-w-full mx-auto">
                {jogos.map((_, idx) => {
                    const isCurrent = (activeIndex - 1 + N) % N === idx;
                    return (
                        <span
                            key={idx}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveIndex(idx + 1);
                                setIsPlaying(false);
                            }}
                            className={`transition-all duration-300 shrink-0 rounded-full cursor-pointer ${isCurrent ? 'bg-[#66c0f4]' : 'bg-[#2a475e]'}`}
                            style={{ 
                                width: isCurrent ? '20px' : '8px', 
                                height: '8px', 
                                minWidth: isCurrent ? '20px' : '8px',
                                maxWidth: isCurrent ? '20px' : '8px',
                                display: 'inline-block'
                            }}
                            role="button"
                            aria-label={`Ir para jogo ${idx + 1}`}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default function Vitrine() {
    const [jogos, setJogos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const navigate = useNavigate();

    const [busca, setBusca] = useState('');
    const [generosSelecionados, setGenerosSelecionados] = useState([]);
    const [meusJogosIds, setMeusJogosIds] = useState(new Set());
    const { estaAutenticado } = useAuth();
    const [eMobile, setEMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setEMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        carregarJogos();
        if (estaAutenticado) {
            carregarBiblioteca();
        }
    }, [estaAutenticado]);

    const carregarBiblioteca = async () => {
        try {
            const biblioteca = await bibliotecaService.listar();
            const itens = Array.isArray(biblioteca) ? biblioteca : (biblioteca.itens || []);
            const ids = new Set(itens.map(item => {
                const j = item.jogo || item;
                return j.id;
            }));
            setMeusJogosIds(ids);
        } catch (err) {
            console.error('Erro ao carregar biblioteca na vitrine', err);
        }
    };

    const carregarJogos = async () => {
        try {
            setCarregando(true);
            setErro(null);
            const dados = await jogosService.listar(1, 100);
            
            // A API retorna { pagina, limite, total, paginas, itens }
            const jogosList = dados.itens || [];
            setJogos(jogosList);
        } catch (err) {
            setErro(err.message || 'Erro ao conectar com o servidor da API.');
            setJogos([]);
        } finally {
            setCarregando(false);
        }
    };

    const generosDisponiveis = jogos.reduce((acc, jogo) => {
        if(jogo.generos){
            jogo.generos.forEach((gen) => {
                if(!acc.includes(gen.nome)){
                    acc.push(gen.nome);
                };
            });
        };
        return acc;
    }, []);

    const onAlterarGenero = (genero) => {
        setGenerosSelecionados((prev) => 
            prev.includes(genero)
            ? prev.filter((g) => g !== genero)
            : [...prev, genero]
        );
    };

    const limparGeneros = () => {
        setGenerosSelecionados([]);
    };

    const jogosFiltrados = jogos.filter((jogo) => {
        const correspondenteGenero = generosSelecionados.length === 0 || (jogo.generos && jogo.generos.some(gen => generosSelecionados.includes(gen.nome)));
        const correspondenteTexto = busca === '' || jogo.titulo.toLowerCase().includes(busca.toLowerCase());

        return correspondenteGenero && correspondenteTexto;
    });

    if(carregando){
        return (
            <div className="text-center text-[#8f98a0] py-20 animate-pulse text-lg">
                Carregando catálogo de jogos...
            </div>
        );
    };

    if(erro){
        return (
            <div className="text-center text-red-400 py-10 px-6 border border-red-500/20 bg-red-500/5 rounded-md max-w-xl mx-auto my-10">
                <p className="font-semibold">Não foi possível carregar o catálogo de jogos.</p>
                <p className="text-sm text-red-400/70 mt-1">{erro}</p>
            </div>
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            <FiltroGeneros
                generosDisponiveis={generosDisponiveis}
                generosSelecionados={generosSelecionados}
                onAlterarGenero={onAlterarGenero}
                onLimparGeneros={limparGeneros}
            />

            <div className="flex flex-col md:flex-row gap-4 mb-8 mt-4 items-center justify-between">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-[#567086]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input 
                        type="text"
                        placeholder="Buscar jogos no catálogo..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full bg-[#16202d]/80 backdrop-blur-sm border border-[#2a475e]/70 rounded-full pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#66c0f4] focus:ring-1 focus:ring-[#66c0f4] transition-all duration-300 shadow-inner hover:bg-[#1a2634]"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between mt-8 mb-6 border-b border-[#2a475e]/30 pb-4">
                <h2 className="text-white font-bold text-2xl tracking-wide uppercase flex items-center gap-3">
                    Destaques da Loja
                    {jogosFiltrados.length > 0 && (
                        <span className="bg-[#2a475e]/50 text-[#66c0f4] text-sm px-3 py-1 rounded-full border border-[#66c0f4]/30 font-medium shadow-inner">
                            {jogosFiltrados.length}
                        </span>
                    )}
                </h2>
            </div>

            {eMobile ? (
                <CarrosselVitrine 
                    jogos={jogosFiltrados} 
                    meusJogosIds={meusJogosIds} 
                    navigate={navigate} 
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {jogosFiltrados.map((jogo) => (
                        <div
                            key={jogo.id}
                            onClick={() => navigate(`/jogo/${jogo.id}`)}
                            className="group bg-[#16202d]/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#2a475e]/50 cursor-pointer transition-all duration-400 hover:border-[#66c0f4]/60 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(102,192,244,0.12)] flex flex-col"
                        >
                            <div className="w-full h-44 relative overflow-hidden bg-[#0d121a] flex items-center justify-center">
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
                                <div className="absolute inset-0 bg-gradient-to-t from-[#16202d] via-[#16202d]/20 to-transparent opacity-90"></div>
                                
                                {/* Preço */}
                                <div className="absolute bottom-3 right-3 bg-[#16202d]/95 backdrop-blur-md px-2.5 py-1 rounded border border-[#2a475e]/80 shadow-md">
                                    <span className="text-[#b8cedf] font-bold text-[13px] tracking-wide">{`R$ ${jogo.preco?.toFixed(2) || '0,00'}`}</span>
                                </div>

                                {/* Categoria principal sobre a imagem para otimizar espaço */}
                                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                                    {jogo.generos && jogo.generos.length > 0 && (
                                        <span className="bg-[#2a475e]/80 backdrop-blur-md text-[#b8cedf] text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-[#2a475e]/60">
                                            {jogo.generos[0].nome}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 flex-grow flex flex-col justify-start relative">
                                <h3 className="text-white font-bold text-[16px] truncate mb-1 group-hover:text-[#66c0f4] transition-colors tracking-wide drop-shadow-sm">{jogo.titulo}</h3>
                                
                                <span className="text-[#66c0f4] text-[10px] font-bold tracking-wider uppercase mb-3">
                                    {jogo.desenvolvedora || "Desconhecido"}
                                </span>
                                
                                <p className="text-[#acb2b8] text-[12px] leading-relaxed line-clamp-2">
                                    {jogo.descricao || "Nenhuma descrição disponível."}
                                </p>
                            </div>
                            
                            <div className="border-t border-[#2a475e]/30 p-4 flex items-center justify-between gap-3 bg-[#10141d]/60">
                                <div className="flex flex-col gap-1.5 text-[11px] text-[#8f98a0] font-mono tracking-tight">
                                    <span className="flex items-center gap-1.5">
                                        Lançamento: <strong className="text-[#b8cedf] font-semibold">{jogo.lancamento ? new Date(jogo.lancamento).toLocaleDateString('pt-BR', { year: 'numeric' }) : "---"}</strong>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        Avaliações: <strong className="text-[#66c0f4] font-bold">{jogo._count?.reviews || 0}</strong>
                                    </span>
                                </div>

                                <div>
                                    {meusJogosIds.has(jogo.id) ? (
                                        <button 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                navigate('/biblioteca'); 
                                            }}
                                            className="bg-gradient-to-r from-[#2a475e] to-[#203648] text-[#66c0f4] px-4 py-1.5 rounded text-[11px] font-bold hover:from-[#345975] hover:to-[#2a475e] transition-all cursor-pointer border border-[#66c0f4]/30 shadow-sm hover:shadow-[0_0_10px_rgba(102,192,244,0.2)]"
                                        >
                                            Biblioteca
                                        </button>
                                    ) : (
                                        <button className="bg-gradient-to-r from-[#1a7bcb] to-[#145e9b] text-white px-4 py-1.5 rounded text-[11px] font-bold hover:from-[#1e85dc] hover:to-[#176fa6] transition-all cursor-pointer shadow-[0_4px_10px_rgba(26,123,203,0.3)] hover:shadow-[0_0_15px_rgba(102,192,244,0.4)]">
                                            Detalhes
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {jogosFiltrados.length === 0 && (
                <div className="text-center py-24 px-6 border border-[#2a475e]/30 bg-[#16202d]/80 backdrop-blur-md rounded-2xl max-w-xl mx-auto shadow-xl">
                    <svg className="w-16 h-16 mx-auto text-[#2a475e] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <p className="text-[#b8cedf] text-lg font-medium">Nenhum jogo encontrado</p>
                    <p className="text-sm text-[#8f98a0] mt-2">Não encontramos resultados com os filtros atuais. Tente buscar algo diferente.</p>
                </div>
            )}
        </div>
    );
}
