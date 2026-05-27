// URL base da API. No deploy, troque este valor pela URL do back-end no Railway.
window.DEER_API_URL = window.DEER_API_URL || 'http://localhost:3000';

// Monta URLs da API sem espalhar "localhost" pelos arquivos do front-end.
window.deerApi = function(path = '') {
    const caminho = path.startsWith('/') ? path : `/${path}`;
    return `${window.DEER_API_URL}${caminho}`;
};
