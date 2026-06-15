import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [modoPrimeiroAcesso, setModoPrimeiroAcesso] = useState(false);
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  
  const navigate = useNavigate();
  const { login, primeiroAcesso, carregando, estaAutenticado } = useAuth();

  React.useEffect(() => {
    if (estaAutenticado) {
      navigate('/', { replace: true });
    }
  }, [estaAutenticado, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      if (modoPrimeiroAcesso) {
        await primeiroAcesso(matricula, senha);
        alert('Primeiro acesso registrado com sucesso! Agora realize o seu login de entrada.');
        setModoPrimeiroAcesso(false);
        setMatricula('');
        setSenha('');
      } else {
        await login(matricula, senha);
        navigate('/');
      }
    } catch (err) {
      setErro(err.message || 'Ocorreu um erro ao processar a requisição.');
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spinLed {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
        `}
      </style>
      <div className="w-full max-w-md mx-auto my-12 relative p-[2px] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(102,192,244,0.15)] hover:shadow-[0_0_60px_rgba(102,192,244,0.2)] transition-shadow duration-500 group">
        
        {/* Fundo do Card (Borda estática) */}
        <div className="absolute inset-0 bg-[#2a475e]/50 rounded-2xl"></div>

        {/* LED Giratório */}
        <div 
          className="absolute top-1/2 left-1/2 w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent_70%,#66c0f4_100%)] opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          style={{ animation: 'spinLed 3s linear infinite' }}
        />

        {/* Conteúdo Principal do Card */}
        <div className="relative bg-[#16202d] backdrop-blur-xl rounded-[14px] p-8 z-10 w-full h-full flex flex-col">
          <div className="text-center mb-10 mt-2">
            <h2 className="text-white text-3xl font-bold tracking-widest uppercase font-mono relative inline-block">
              VAPOR
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-[2px] bg-[#66c0f4] shadow-[0_0_10px_#66c0f4] opacity-80 rounded-full"></div>
            </h2>
            <p className="text-[#66c0f4] text-xs uppercase tracking-wider mt-5 font-medium opacity-90">
              {modoPrimeiroAcesso ? 'Primeiro Acesso' : 'Inicie sua sessão'}
            </p>
          </div>

          {erro && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center shadow-[0_0_10px_rgba(239,68,68,0.1)]">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-[#8f98a0] text-xs uppercase tracking-wider font-semibold ml-1">Matrícula</label>
              <input 
                type="text" 
                required
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                disabled={carregando}
                className="bg-[#10141d] border border-[#2a475e]/70 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#66c0f4] focus:ring-1 focus:ring-[#66c0f4] transition-all duration-300 disabled:opacity-50 shadow-inner"
                placeholder="Digite sua matrícula"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#8f98a0] text-xs uppercase tracking-wider font-semibold ml-1">Senha</label>
              <input 
                type="password" 
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={carregando}
                className="bg-[#10141d] border border-[#2a475e]/70 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#66c0f4] focus:ring-1 focus:ring-[#66c0f4] transition-all duration-300 disabled:opacity-50 shadow-inner"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={carregando}
              className="bg-gradient-to-r from-[#1a7bcb] to-[#145e9b] text-white hover:from-[#1e85dc] hover:to-[#176fa6] py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-[0_4px_15px_rgba(26,123,203,0.3)] hover:shadow-[0_0_25px_rgba(102,192,244,0.4)] mt-2 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {carregando ? 'Processando...' : modoPrimeiroAcesso ? 'Confirmar Primeiro Acesso' : 'Iniciar Sessão'}
            </button>
          </form>

          <div className="border-t border-[#2a475e]/30 mt-8 pt-6 text-center">
            <button 
              onClick={() => {
                setModoPrimeiroAcesso(!modoPrimeiroAcesso);
                setMatricula('');
                setSenha('');
                setErro('');
              }}
              disabled={carregando}
              className="text-[#66c0f4] hover:text-white text-xs bg-transparent border-none cursor-pointer disabled:opacity-50 transition-colors duration-300 font-medium tracking-wide"
            >
              {modoPrimeiroAcesso ? 'Já possui cadastro? Entre por aqui' : 'É seu primeiro acesso? Registre-se aqui'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
