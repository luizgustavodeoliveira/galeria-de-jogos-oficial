import React, { useState, useEffect, useRef } from 'react';

export default function FiltroGeneros({ generosDisponiveis, generosSelecionados, onAlterarGenero, onLimparGeneros}) {
    const [estaAberto, setEstaAberto] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickFora(event) {
            if(dropdownRef.current && !dropdownRef.current.contains(event.target)){
                setEstaAberto(false);
            };
        };
        document.addEventListener('mousedown', handleClickFora);
        return () => {document.removeEventListener('mousedown', handleClickFora)};
    }, []);

    return (
        <div className="flex flex-col gap-1.5 relative w-full sm:w-72" ref={dropdownRef}>
            <label className="text-[#8f98a0] text-xs uppercase tracking-wide font-mono">
                Filtrar por gênero
            </label>

            <button
                type="button"
                onClick={() => setEstaAberto(!estaAberto)}
                className="w-full bg-[#10141d] border border-[#2a475e] rounded px-4 py-2.5 text-white text-sm flex justify-between items-center hover:border-[#66c0f4] transition-colors cursor-pointer text-left font-sans"
            >
                <span className="truncate">
                    {generosSelecionados.length > 0 ? generosSelecionados.join(', ') : 'Todos os gêneros'}
                </span>
                <span className={`text-[#66c0f4] text-xs transition-transform duration-200 ${estaAberto ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            {estaAberto && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-[#16202d] border border-[#2a475e] rounded shadow-2xl z-50 flex flex-col max-h-60 overflow-hidden animate-fade-in">
                    <div className="p-2 border-b border-[#2a475e]/40 bg-[#10141d]/60 flex justify-between items-center text-[11px]">
                        <span className="text-[#567086] font-mono uppercase">Opções</span>
                        {generosSelecionados.length > 0 && (
                            <button
                                type="button"
                                onClick={onLimparGeneros}
                                className="text-[#66c0f4] hover:underline cursor-pointer"
                            >
                                Limpar todos
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto p-2 flex flex-col gap-1.5 custom-scrollbar">
                        {generosDisponiveis.map((genero) => {
                            const estaSelecionado = generosSelecionados.includes(genero);
                            return (
                                <label 
                                    key={genero}
                                    className={`flex items-center gap-3 px-2 py-1.5 rounded cursor-pointer transition-colors text-sm select-none ${
                                    estaSelecionado  
                                    ? 'bg-[#66c0f4]/10 text-white font-medium' 
                                    : 'text-[#acb2b8] hover:bg-[#10141d] hover:text-white'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={estaSelecionado}
                                        onChange={() => onAlterarGenero(genero)}
                                    />
                                    <span>{genero}</span>
                                </label>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
};
