import React, { useState, useEffect, use } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://alunos-ads-api-production.up.railway.app';

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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {jogos.map((jogo) => (
                    <div
                        key={jogo.id}
                        onClick={() => navigate(`/jogo/${jogo.id}`)}
                        className="bg-[#16202d] rounded overflow-hidden border border-transparent cursor-pointer transition-all duration-200 hover:border-[#66c0f4] hover:-translate-y-1 shadow-lg flex flex-col justify-between"
                    >
                        <img src={jogo.capaUrl}></img>
                        <div className="p-4 flex-grow flex flex-col justify-between">
                            <div>
                                <h3 className="text-white font-medium text-base truncate mb-1">{jogo.titulo}</h3>
                                <span className="text-[#567086] text-xs block mb-4">
                                    {jogo.generos && jogo.generos.length > 0
                                        ? jogo.generos.map((g) => g.nome).join(', ')
                                    : "Sem gênero"}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-auto">
                            <span className="text-[#b8cedf] font-bold text-sm">{jogo.preco}</span>
                            <button className="bg-[#4c6b22] text-[#b5dc14] px-3 py-1.5 rounded-sm text-xs font-bold hover:bg-[#5a7f28] transition-colors cursor-pointer">
                                Ver detalhes
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}