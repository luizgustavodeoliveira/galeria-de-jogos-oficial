import React, { useState, useEffect, use } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://alunos-ads-api-production.up.railway.app';

const IMAGEM_DEFAULT = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=500&auto=format&fit=crop';

export default function Vitrine() {
    const [jogos, setJogos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API_URL}/jogos`)
            .then((res) => {
                if (!res.ok) throw new Error('Erro ao conectar com o servidor da API.')
                return res.json();
            })
            .then((data) => {
                setJogos(data.itens || []);
                setCarregando(false);
            })
            .catch((err) => {
                setErro(err.message);
                setCarregando(false);
            })
    }, []);

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
            <h2 className="text-white font-light text-2xl tracking-wide mb-6 uppercase">
                Destaques e Recomendados
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
                {jogos.map((jogo) => (
                    <div
                        key={jogo.id}
                        onClick={() => navigate(`/jogo/${jogo.id}`)}
                        className="bg-[#16202d] rounded overflow-hidden border border-transparent cursor-pointer transition-all duration-200 hover:border-[#66c0f4] hover:-translate-y-1 shadow-lg flex flex-col justify-between"
                    >
                        <div className="w-full h-44 bg-[#10141d] flex items-center justify-center p-2">
                            <img 
                                src={jogo.capaUrl || IMAGEM_DEFAULT}
                                alt={jogo.titulo}
                                className="w-full h-[160px] object-cover object-center bg-[#10141d] block"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = IMAGEM_DEFAULT;
                                }}
                            ></img>
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
                                    <span className="text-[#66c0f4] text-xs block mb-3 font-semibold tracking-wide uppercase">{jogo.desenvolvedora}</span>
                                ) : (
                                    <span>{"Desenvolvedor desconhecido"}</span>
                                )}
                                <p className="text-[#acb2b8] text-xs leading-relaxed line-clamp-3 mb-3">
                                    {jogo.descricao || "Sem descrição disponível."}
                                </p>
                            </div>
                        </div>
                        
                        <div className="border-t border-[#2a475e]/30 pt-3 flex flex-col gap-1 text-[11px] text-[#567086] p-2">
                            <div>
                                Lançamento: <span className="text-[#8f98a0]">
                                    {jogo.lancamento ? new Date(jogo.lancamento).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    }) : "Data desconhecida"}
                                </span>
                            </div>

                            <div>
                                Análises: <span className="text-[#66c0f4] font-medium">
                                    {jogo._count?.reviews || "Nenhuma análise disponível."}   
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-2">
                            <span className="text-[#b8cedf] font-bold text-sm">{`R$ ${jogo.preco?.toFixed(2) || '0,00'}`}</span>
                            <button className="bg-[#4c6b22] text-[#b5dc14] px-4 py-2 rounded-sm text-xs font-bold hover:bg-[#5a7f28] transition-colors cursor-pointer">
                                Ver detalhes
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}