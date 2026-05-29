# DEER - Sistema de doacao para instituicoes

A DEER e uma plataforma academica para conectar doadores a instituicoes e projetos sociais. O objetivo e facilitar a busca por locais que recebem doacoes, organizar categorias aceitas e permitir que instituicoes sejam analisadas antes de aparecerem publicamente.

## Funcionalidades atuais

- Cadastro de usuarios em etapas, com validacoes de nome, e-mail, senha, CPF, telefone e endereco.
- Login com e-mail ou CPF.
- Senhas protegidas com hash usando bcrypt no back-end.
- Perfil de usuario com foto, cor de banner, tema claro/escuro, biografia e endereco.
- Exclusao de conta com confirmacao de senha e aceite de aviso permanente.
- Vinculo de instituicao ao perfil do usuario.
- Consulta de CNPJ e CEP pela BrasilAPI.
- Validacao de categorias aceitas e chave Pix.
- Status de solicitacao de instituicao: pendente, aprovada ou rejeitada.
- Listagem publica apenas de instituicoes aprovadas.
- Cards de instituicoes com filtro por categoria.
- Avisos visuais customizados no lugar de alerts nativos do navegador.

## Tecnologias

### Front-end

- HTML5
- CSS3
- JavaScript

### Back-end

- Node.js
- Express
- Supabase JS
- bcryptjs

### Banco de dados

- PostgreSQL via Supabase
- Antes do deploy, atualize `assets/js/config.js` com a URL publica do back-end.
- O README deve receber as URLs finais do front-end e do back-end depois do deploy.
- As policies do Supabase precisam permitir apenas as operacoes esperadas para cada tabela e bucket.
