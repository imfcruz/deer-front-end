window.DEER_API_URL = window.DEER_API_URL || 'https://deer-back-end-production.up.railway.app';

// Monta URLs da API sem espalhar "localhost" pelos arquivos do front-end.
window.deerApi = function(path = '') {
    const caminho = path.startsWith('/') ? path : `/${path}`;
    return `${window.DEER_API_URL}${caminho}`;
};
