window.DEER_API_URL = window.DEER_API_URL || 'https://deer-back-end-production.up.railway.app';

// Monta URLs da API sem espalhar "localhost" pelos arquivos do front-end.
window.deerApi = function(path = '') {
    const caminho = path.startsWith('/') ? path : `/${path}`;
    return `${window.DEER_API_URL}${caminho}`;
};

// Sessão simples do front: usuário para a interface e token para provar login ao back-end.
window.salvarSessaoDeer = function(usuario, token) {
    sessionStorage.setItem('deer_sessao', JSON.stringify(usuario));
    if (token) sessionStorage.setItem('deer_token', token);
};

window.limparSessaoDeer = function() {
    sessionStorage.removeItem('deer_sessao');
    sessionStorage.removeItem('deer_token');
};

window.deerAuthHeaders = function(headers = {}) {
    const token = sessionStorage.getItem('deer_token');
    return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
};
