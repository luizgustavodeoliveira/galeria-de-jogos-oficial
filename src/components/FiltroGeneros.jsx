import React, { useState, useEffect, useRef } from 'react';

export default function FiltroGeneros({ generosDisponiveis, generosSelecionados, onAlterarGenero, onLimparGeneros }) {
    const [estaAberto, setEstaAberto] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickFora(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setEstaAberto(false);
            };
        };
        document.addEventListener('mousedown', handleClickFora);
        return () => { document.removeEventListener('mousedown', handleClickFora) };
    }, []);

    return (
        <div className="flex flex-col gap-2 relative w-full sm:w-80" ref={dropdownRef}>
            <label className="text-[#8f98a0] text-xs uppercase tracking-wider font-semibold ml-1">
                Filtro de Gêneros
            </label>

            <button
                type="button"
                onClick={() => setEstaAberto(!estaAberto)}
                className="w-full bg-[#16202d]/80 backdrop-blur-sm border border-[#2a475e]/70 rounded-full px-5 py-3 text-white text-sm flex justify-between items-center hover:bg-[#1a2634] hover:border-[#66c0f4]/80 transition-all duration-300 cursor-pointer text-left shadow-inner group"
            >
                <span className="truncate font-medium text-[#b8cedf] group-hover:text-white transition-colors">
                    {generosSelecionados.length > 0 ? `${generosSelecionados.length} gênero(s) selecionado(s)` : 'Todos os gêneros'}
                </span>
                <svg className={`w-4 h-4 text-[#66c0f4] transition-transform duration-300 ${estaAberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            {estaAberto && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#16202d]/95 backdrop-blur-xl border border-[#2a475e]/60 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 flex flex-col max-h-72 overflow-hidden transform transition-all">
                    <div className="px-4 py-3 border-b border-[#2a475e]/40 bg-[#10141d]/40 flex justify-between items-center backdrop-blur-sm">
                        <span className="text-[#8f98a0] text-xs font-semibold tracking-wider uppercase">Selecionar Opções</span>
                        {generosSelecionados.length > 0 && (
                            <button
                                type="button"
                                onClick={onLimparGeneros}
                                className="text-[#66c0f4] text-xs hover:text-white hover:underline transition-colors font-medium cursor-pointer"
                            >
                                Limpar
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar">
                        {generosDisponiveis.map((genero) => {
                            const estaSelecionado = generosSelecionados.includes(genero);
                            return (
                                <label
                                    key={genero}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sm select-none group ${estaSelecionado
                                        ? 'bg-gradient-to-r from-[#2a475e]/60 to-[#16202d]/60 text-white shadow-sm border border-[#66c0f4]/30'
                                        : 'text-[#acb2b8] hover:bg-[#1a2634] hover:text-white border border-transparent'
                                        }`}
                                >
                                    <span className={`font-medium ${estaSelecionado ? 'text-[#66c0f4]' : 'group-hover:translate-x-1 transition-transform'}`}>{genero}</span>
                                    
                                    {/* Custom Checkbox/Indicator */}
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${estaSelecionado ? 'bg-[#66c0f4] border-[#66c0f4]' : 'border-[#567086] group-hover:border-[#66c0f4]/50'}`}>
                                        {estaSelecionado && (
                                            <svg className="w-3.5 h-3.5 text-[#10141d]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        )}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={estaSelecionado}
                                        onChange={() => onAlterarGenero(genero)}
                                    />
                                </label>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
};
