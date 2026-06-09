// Endereco base do back-end hospedado no Railway. Todos os fetchs do front usam esse valor.
window.DEER_API_URL = window.DEER_API_URL || 'https://deer-back-end-production.up.railway.app';

// Evita repetir a URL do servidor em cada arquivo. Se a rota vier sem barra, a funcao ajusta.
window.deerApi = function(path = '') {
    const caminho = path.startsWith('/') ? path : `/${path}`;
    return `${window.DEER_API_URL}${caminho}`;
};

// Guarda os dados usados pela interface e o token que o back-end exige em rotas protegidas.
window.salvarSessaoDeer = function(usuario, token) {
    sessionStorage.setItem('deer_sessao', JSON.stringify(usuario));
    if (token) sessionStorage.setItem('deer_token', token);
};

// Limpa tudo que identifica o usuario no navegador. Usado principalmente no botao de sair.
window.limparSessaoDeer = function() {
    sessionStorage.removeItem('deer_sessao');
    sessionStorage.removeItem('deer_token');
};

// Junta os headers normais da requisicao com o Authorization quando existe token salvo.
window.deerAuthHeaders = function(headers = {}) {
    const token = sessionStorage.getItem('deer_token');
    return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
};
