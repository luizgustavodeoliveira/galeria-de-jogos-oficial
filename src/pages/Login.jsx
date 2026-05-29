import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [modoPrimeiroAcesso, setModoPrimeiroAcesso] = useState(false);
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  
  const navigate = useNavigate();
  const { login, primeiroAcesso, carregando } = useAuth();

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
    <div className="w-full max-w-md mx-auto my-12 p-8 bg-[#16202d] rounded border border-[#2a475e]/40 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-white text-2xl font-bold tracking-widest uppercase font-mono">VAPOR</h2>
        <p className="text-[#66c0f4] text-xs uppercase tracking-wider mt-1">
          {modoPrimeiroAcesso ? 'Primeiro Acesso' : 'Inicie sua sessão'}
        </p>
      </div>

      {erro && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[#8f98a0] text-xs uppercase tracking-wide">Matrícula</label>
          <input 
            type="text" 
            required
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            disabled={carregando}
            className="bg-[#10141d] border border-[#2a475e] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#66c0f4] transition-colors disabled:opacity-50"
            placeholder="Digite sua matrícula"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[#8f98a0] text-xs uppercase tracking-wide">Senha</label>
          <input 
            type="password" 
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={carregando}
            className="bg-[#10141d] border border-[#2a475e] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#66c0f4] transition-colors disabled:opacity-50"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit"
          disabled={carregando}
          className="bg-gradient-to-r from-[#1a7bcb] to-[#145e9b] text-white hover:from-[#1e85dc] hover:to-[#176fa6] py-2.5 rounded-sm font-semibold text-sm transition-all shadow-lg mt-2 cursor-pointer disabled:opacity-50"
        >
          {carregando ? 'Processando...' : modoPrimeiroAcesso ? 'Confirmar Primeiro Acesso' : 'Iniciar Sessão'}
        </button>
      </form>

      <div className="border-t border-[#2a475e]/20 mt-6 pt-4 text-center">
        <button 
          onClick={() => {
            setModoPrimeiroAcesso(!modoPrimeiroAcesso);
            setMatricula('');
            setSenha('');
            setErro('');
          }}
          disabled={carregando}
          className="text-[#66c0f4] hover:underline text-xs bg-none border-none cursor-pointer disabled:opacity-50"
        >
          {modoPrimeiroAcesso ? 'Já possui cadastro? Entre por aqui' : 'É seu primeiro acesso? Registre-se aqui'}
        </button>
      </div>
    </div>
  );
}
