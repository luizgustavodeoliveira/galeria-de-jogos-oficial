import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://alunos-ads-api-production.up.railway.app';

export default function Login() {
  const [modoPrimeiroAcesso, setModoPrimeiroAcesso] = useState(false);
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    const rotaEndpoint = modoPrimeiroAcesso ? '/auth/primeiro-acesso' : '/auth/login';

    try {
      const resposta = await fetch(`${API_URL}${rotaEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricula, senha })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || 'Ocorreu um erro ao processar a requisição.');
      }

      if (modoPrimeiroAcesso) {
        alert('Primeiro acesso registrado com sucesso! Agora realize o seu login de entrada.');
        setModoPrimeiroAcesso(false); 
      } else {
        localStorage.setItem('token', dados.token);
        navigate('/');
      }
    } catch (erro) {
      alert(erro.message);
    } finally {
      setCarregando(false);
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[#8f98a0] text-xs uppercase tracking-wide">Matrícula</label>
          <input 
            type="text" 
            required
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            className="bg-[#10141d] border border-[#2a475e] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#66c0f4] transition-colors"
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
            className="bg-[#10141d] border border-[#2a475e] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#66c0f4] transition-colors"
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
          }}
          className="text-[#66c0f4] hover:underline text-xs bg-none border-none cursor-pointer"
        >
          {modoPrimeiroAcesso ? 'Já possui cadastro? Entre por aqui' : 'É seu primeiro acesso? Registre-se aqui'}
        </button>
      </div>
    </div>
  );
}