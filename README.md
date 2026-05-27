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

## Estrutura principal

- `index.html`: pagina inicial da plataforma.
- `pages/cadastro.html`: cadastro de usuario.
- `pages/login.html`: login com e-mail ou CPF.
- `pages/perfil.html`: perfil do usuario.
- `pages/cadastro-ong.html`: fluxo de vinculo de instituicao.
- `pages/ongs.html`: listagem publica de instituicoes aprovadas.
- `assets/css/styles.css`: estilos globais e temas.
- `assets/js/script.js`: funcoes gerais, tema, login/cadastro base e cards publicos.
- `assets/js/perfil.js`: logica da pagina de perfil.
- `assets/js/instituicoes.js`: logica do cadastro e acompanhamento de instituicao.
- `server/src/server.js`: API Express integrada ao Supabase.

## Como rodar localmente

1. Instale as dependencias do back-end:

```bash
cd server
npm install
```

2. Crie o arquivo `.env` dentro da pasta `server` com:

```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase
PORT=3000
```

3. Inicie o servidor:

```bash
npm run dev
```

4. Abra o front-end pelo navegador ou por uma extensao como Live Server.

## Observacoes de entrega

- Antes do deploy, atualize `assets/js/config.js` com a URL publica do back-end.
- O README deve receber as URLs finais do front-end e do back-end depois do deploy.
- As policies do Supabase precisam permitir apenas as operacoes esperadas para cada tabela e bucket.
