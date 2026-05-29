const API_URL = 'https://alunos-ads-api-production.up.railway.app';

// Função auxiliar para fazer requisições
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['token'] = token;
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.mensagem || errorData.message || `Erro ${response.status}`;
    throw new Error(errorMessage);
  }

  // Para respostas 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// ==================== AUTH ====================
export const authService = {
  login: (matricula, senha) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ matricula, senha })
    }),

  primeiroAcesso: (matricula, senha) =>
    request('/auth/primeiro-acesso', {
      method: 'POST',
      body: JSON.stringify({ matricula, senha })
    }),

  me: () => request('/auth/me', { method: 'GET' })
};

// ==================== JOGOS ====================
export const jogosService = {
  listar: (pagina = 1, limite = 20, busca = '', genero = '', ordenar = 'titulo', direcao = 'asc') => {
    const params = new URLSearchParams();
    params.append('pagina', pagina);
    params.append('limite', limite);
    if (busca) params.append('busca', busca);
    if (genero) params.append('genero', genero);
    params.append('ordenar', ordenar);
    params.append('direcao', direcao);

    return request(`/jogos?${params.toString()}`, { method: 'GET' });
  },

  obter: (id) => request(`/jogos/${id}`, { method: 'GET' }),

  criar: (dados) =>
    request('/jogos', {
      method: 'POST',
      body: JSON.stringify(dados)
    }),

  atualizar: (id, dados) =>
    request(`/jogos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    }),

  deletar: (id) =>
    request(`/jogos/${id}`, { method: 'DELETE' })
};

// ==================== BIBLIOTECA ====================
export const bibliotecaService = {
  listar: () => request('/biblioteca/me', { method: 'GET' }),

  adicionar: (jogoId) =>
    request(`/biblioteca/${jogoId}`, { method: 'POST' }),

  atualizar: (jogoId, dados) =>
    request(`/biblioteca/${jogoId}`, {
      method: 'PATCH',
      body: JSON.stringify(dados)
    }),

  deletar: (jogoId) =>
    request(`/biblioteca/${jogoId}`, { method: 'DELETE' })
};

// ==================== REVIEWS ====================
export const reviewsService = {
  obter: (id) => request(`/reviews/${id}`, { method: 'GET' }),

  criar: (jogoId, dados) =>
    request(`/jogos/${jogoId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(dados)
    }),

  atualizar: (id, dados) =>
    request(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    }),

  atualizarParcial: (id, dados) =>
    request(`/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dados)
    }),

  deletar: (id) =>
    request(`/reviews/${id}`, { method: 'DELETE' })
};

// ==================== GENEROS ====================
export const generosService = {
  listar: () => request('/generos', { method: 'GET' })
};

// ==================== WISHLIST ====================
export const wishlistService = {
  listar: () => request('/wishlist/me', { method: 'GET' }),

  adicionar: (jogoId) =>
    request(`/wishlist/${jogoId}`, { method: 'POST' }),

  deletar: (jogoId) =>
    request(`/wishlist/${jogoId}`, { method: 'DELETE' })
};
