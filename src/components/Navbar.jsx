import { Link } from 'react-router';

export default function Navbar() {
    return (
        <header className="bg-[#171a21] px-[10%] py-4 border-b border-[#2a475e]/40 flex items-center justify-between shadow-md">
            <Link to="/" className="flex items-center gap-3 no-underline group">
                <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#101822] to-[#2a475e] border border-[#66c0f4] flex items-center justify-center text-[#66c0f4] font-bold text-lg transition-transform group-hover:scale-105">
                    V
                </div>
                <span className="text-white text-2xl font-bold tracking-widest uppercase font-mono">VAPOR</span>
            </Link>

            <div className="flex gap-4">
                <button className="px-4 py-2 rounded text-sm font-semibold border border-[#66c0f4] text-[#66c0f4] hover:bg-[#66c0f4]/10 transition-colors cursor-pointer">
                    Entrar
                </button>
                <button className="px-4 py-2 rounded text-sm font-semibold bg-[#1a7bcb] text-white hover:bg-[#1e85dc] transition-colors shadow-lg cursor-pointer">
                    Cadastrar
                </button>
            </div>
        </header>
    );
}