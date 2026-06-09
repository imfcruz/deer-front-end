// Funcoes reutilizadas em varias telas: formatam dados enquanto o usuario digita.
function mascaraCPF(input) {
    input.addEventListener('input', () => {
        let v = input.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
        else if (v.length > 3) v = v.replace(/(\d{3})(\d{3})/, '$1.$2');
        input.value = v;
    });
}

// Deixa o telefone no formato visual usado no Brasil, mas sem mudar o dado final do back-end.
function mascaraTelefone(input) {
    input.addEventListener('input', () => {
        let v = input.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        input.value = v;
    });
}

// Cria o botao de mostrar/ocultar senha ao lado do input recebido.
function olhinho(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative; display:flex; align-items:center; width: 100%;';
    input.style.width = '100%'; 
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const btn = document.createElement('button');
    btn.type = 'button';

    const caminho = window.location.pathname.includes('/pages/') 
        ? '../assets/img/' 
        : 'assets/img/';

    btn.style.cssText = `
        position:absolute; right:10px; background:none; border:none;
        cursor:pointer; padding:0; line-height:1; display:flex; align-items:center;
    `;
    btn.innerHTML = `<img src="${caminho}olho-fechado.png" id="icone-${inputId}" width="32" height="32">`;

    btn.onclick = () => {
        const icone = document.getElementById(`icone-${inputId}`);
        if (input.type === 'password') {
            input.type = 'text';
            icone.src = `${caminho}olho-aberto.png`;
        } else {
            input.type = 'password';
            icone.src = `${caminho}olho-fechado.png`;
        }
    };

    wrapper.appendChild(btn);
}

// Ao abrir qualquer pagina, aplica automaticamente as mascaras nos campos que existirem nela.
document.addEventListener('DOMContentLoaded', () => {
    const cpf = document.getElementById('cpf') || document.getElementById('edit-cpf');
    const tel = document.getElementById('telefone') || document.getElementById('edit-telefone');
    const sen = document.getElementById('senha');
    const cepInput = document.getElementById('cep');

    if (cpf) mascaraCPF(cpf);
    if (tel) mascaraTelefone(tel);
    if (sen) olhinho('senha');
    if (cepInput) mascaraCEP(cepInput);

    const btnAdicionar = document.getElementById('btn-adicionar-endereco');
    const btnDepois = document.getElementById('btn-preencher-depois');
    const secao = document.getElementById('secao-endereco');

    // No cadastro antigo, o usuario escolhia se queria preencher endereco agora ou depois.
    if (btnAdicionar) {
        btnAdicionar.onclick = () => {
            secao.style.display = 'block';
            btnAdicionar.style.display = 'none';
            btnDepois.style.display = 'none';
            sessionStorage.setItem('endereco_opcao', 'adicionar');
            document.getElementById('aviso-endereco').style.display = 'none'; 
        };
    }

    if (btnDepois) {
        btnDepois.onclick = () => {
            btnAdicionar.style.display = 'none';
            btnDepois.style.display = 'none';
            sessionStorage.setItem('endereco_opcao', 'depois');
            document.getElementById('aviso-endereco').style.display = 'none';
        };
    }
});

// Modal reutilizavel para substituir alert() do navegador por um aviso com o visual da DEER.
window.mostrarAvisoGlobal = function(titulo, mensagem, tipo = 'erro') {
    let modal = document.getElementById('modal-aviso-global');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-aviso-global';
        modal.className = 'modal-aviso-overlay';
        modal.innerHTML = `
            <div class="modal-aviso" role="dialog" aria-modal="true" aria-labelledby="modal-aviso-titulo">
                <div class="modal-aviso-icone" id="modal-aviso-icone">!</div>
                <h3 id="modal-aviso-titulo"></h3>
                <p id="modal-aviso-texto"></p>
                <button type="button" class="btn-fechar-aviso">Entendi</button>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('btn-fechar-aviso')) {
                modal.classList.remove('ativo');
            }
        });
    }

    modal.classList.toggle('sucesso', tipo === 'sucesso');
    document.getElementById('modal-aviso-icone').textContent = tipo === 'sucesso' ? '✓' : '!';
    document.getElementById('modal-aviso-titulo').textContent = titulo;
    document.getElementById('modal-aviso-texto').textContent = mensagem;
    modal.classList.add('ativo');
};

// Suporte ao formulario de cadastro antigo. A versao atual usa cadastro.js, mas mantemos este bloco para compatibilidade.
const formCadastro = document.getElementById('auth-form-cadastro');
if (formCadastro) {
    formCadastro.onsubmit = async (e) => {
        e.preventDefault();

        const opcaoEscolhida = sessionStorage.getItem('endereco_opcao');
        if (!opcaoEscolhida) {
            document.getElementById('aviso-endereco').style.display = 'block';
            return;
        }
        
        const dados = {
            nome: document.getElementById('nome').value,
            cpf: document.getElementById('cpf').value.replace(/\D/g, ''),
            email: document.getElementById('email').value,
            senha: document.getElementById('senha').value,
            telefone: document.getElementById('telefone').value,
            cep: document.getElementById('cep')?.value || null,
            rua: document.getElementById('rua')?.value || null,
            bairro: document.getElementById('bairro')?.value || null,
            cidade: document.getElementById('cidade')?.value || null,
            estado: document.getElementById('estado')?.value || null,
            numero: document.getElementById('numero')?.value || null,
            complemento: document.getElementById('complemento')?.value || null,
        };

        try {
            const response = await fetch(window.deerApi('/usuarios'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            const resultado = await response.json();

                if (response.ok) {
                    const toast = document.getElementById('pop-up-sucesso');
                    if (toast) toast.classList.add("show");

                setTimeout(() => {
                    window.salvarSessaoDeer(resultado.data[0], resultado.token);
                    sessionStorage.removeItem('endereco_opcao');
                    window.location.href = "../index.html"; 
                }, 2000);
            } else if (window.mostrarAvisoGlobal) {
                window.mostrarAvisoGlobal('Erro ao cadastrar', resultado.error || 'Verifique os dados e tente novamente.');
            }
        } catch (error) {
            console.error("Erro na conexão:", error);
            if (window.mostrarAvisoGlobal) {
                window.mostrarAvisoGlobal('Servidor indisponível', 'Verifique se o back-end está ligado e tente novamente.');
            }
        }
    };
}

// Suporte ao formulario de login antigo. A tela atual usa login.js, mas este bloco evita quebrar paginas antigas.
const formLogin = document.getElementById('auth-form-login');
if (formLogin) {
    formLogin.onsubmit = async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            const response = await fetch(window.deerApi('/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const resultado = await response.json();

            if (response.ok) {
                window.salvarSessaoDeer(resultado.usuario, resultado.token);
                const estaNaSubpasta = window.location.pathname.includes('/pages/');
                
            } else {
                const toast = document.getElementById('pop-up-erro');
                if (toast) toast.classList.add("show");
                setTimeout(() => toast.remove("show"), 3000);
            }
        } catch (error) {
            if (window.mostrarAvisoGlobal) {
                window.mostrarAvisoGlobal('Servidor indisponível', 'Não foi possível conectar com o back-end.');
            }
        }
    };
}

// Preenche o menu do cabecalho com os dados da sessao salva no navegador.
document.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('user-menu');
    const logado = JSON.parse(sessionStorage.getItem('deer_sessao'));
    
    if (logado && menu) {
        // Evita manter senha no sessionStorage caso algum cadastro antigo tenha salvo esse campo.
        if (logado.senha) {
            delete logado.senha;
            sessionStorage.setItem('deer_sessao', JSON.stringify(logado));
        }
        const primeiroNome = logado.nome.split(' ')[0];
        const estaNaSubpasta = window.location.pathname.includes('/pages/');
        const linkPerfil = estaNaSubpasta ? 'perfil.html' : 'pages/perfil.html';

        let miniaturaHtml = '';
        if (logado.perfil_url) {
            miniaturaHtml = `<img src="${textoSeguro(logado.perfil_url)}" alt="Foto" class="usuario-foto">`;
        } else {
            const iniciais = logado.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
            miniaturaHtml = `<div class="usuario-iniciais">${textoSeguro(iniciais)}</div>`;
        }

        let botaoInstituicao = '';
        let botaoAdmin = '';

        // Mostra atalhos extras de acordo com o tipo de usuario retornado pelo back-end.
        if (logado.tipo === 'instituicao') {
            const linkInstituicao = estaNaSubpasta ? 'instituicao.html' : 'pages/instituicao.html';
            botaoInstituicao = `<a href="${linkInstituicao}" class="login-trigger usuario-acao" style="color: var(--red-base); font-weight: bold;">Painel da ONG</a>`;
        }
        
        if (logado.tipo === 'administrador') {
            const linkAdmin = estaNaSubpasta ? 'administracao.html' : 'pages/administracao.html';
            botaoAdmin = `<a href="${linkAdmin}" class="login-trigger usuario-acao" style="color: var(--red-base); font-weight: bold;">Painel de Administrador</a>`;
        }

        menu.style.display = 'flex';
        menu.style.alignItems = 'center';
        menu.style.gap = '15px';

        menu.innerHTML = `
            <div class="usuario-identidade">
                ${miniaturaHtml}
                <span class="usuario-saudacao">Olá, ${textoSeguro(primeiroNome)}</span>
            </div>
            ${botaoInstituicao} 
            ${botaoAdmin} <a href="${linkPerfil}" class="login-trigger usuario-acao">Meu Perfil</a>
            <button onclick="sair()" class="login-trigger usuario-acao" type="button">Sair</button>
        `;
    }
});

// Quando a conta e excluida, a tela de login recebe um parametro na URL e mostra um aviso.
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('conta') === 'excluida') {
        const aviso = document.createElement('div');
        aviso.style.cssText = `
            background: #fff3f3; border: 1.5px solid #E53935; color: #c62828;
            border-radius: 8px; padding: 12px 16px; margin-bottom: 15px;
            font-size: 0.88rem; font-weight: 600; text-align: center;
        `;
        aviso.textContent = 'Seus dados foram excluídos com sucesso.';

        const form = document.getElementById('auth-form-login');
        if (form) form.insertBefore(aviso, form.firstChild);
    }
});

// Encerra a sessao local e devolve o usuario para a home.
window.sair = () => {
    window.limparSessaoDeer();
    window.location.href = window.location.pathname.includes('pages') ? "../index.html" : "index.html";
};

// Mapa unico das categorias usadas na home, filtros, chips dos cards e formulario de instituicao.
const categoriasDoacao = {
    alimentos: { nome: 'Alimentos', icone: 'diet.png' },
    roupas: { nome: 'Roupas', icone: 'clothes.png' },
    higiene: { nome: 'Higiene e limpeza', icone: 'tissue-roll.png' },
    educacao: { nome: 'Educação', icone: 'stack-of-books.png' },
    brinquedos: { nome: 'Brinquedos', icone: 'donate.png' },
    pets: { nome: 'Pets', icone: 'pets.png' },
    moveis: { nome: 'Móveis e utensílios', icone: 'dining.png' }
};

// Ajusta o caminho das imagens porque a home e as paginas internas ficam em pastas diferentes.
function caminhoIconeCategoria(arquivo) {
    const base = window.location.pathname.includes('/pages/') ? '../assets/img/' : 'assets/img/';
    return `${base}${arquivo}`;
}

// Monta o icone de categoria dentro dos chips dos cards e filtros.
function iconeCategoriaHtml(meta) {
    if (!meta || !meta.icone) return '';
    return `<img class="categoria-chip-icone" src="${caminhoIconeCategoria(meta.icone)}" alt="">`;
}

// Monta o caminho certo quando o clique vem da home ou de uma página dentro de /pages.
function caminhoPaginaOngs(categoria = '') {
    const base = window.location.pathname.includes('/pages/') ? 'ongs.html' : 'pages/ongs.html';
    return categoria ? `${base}?categoria=${encodeURIComponent(categoria)}` : base;
}

// Evita que textos vindos do banco sejam interpretados como HTML dentro dos cards.
function textoSeguro(valor = '') {
    return String(valor || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function limitarTexto(valor = '', limite = 130) {
    const texto = String(valor || '').trim();
    if (texto.length <= limite) return texto;
    return `${texto.slice(0, limite).trim()}...`;
}

// Usado quando a instituicao ainda nao possui logo cadastrada.
function iniciaisInstituicao(instituicao) {
    const nome = instituicao.nome_publico || instituicao.nome_fantasia || instituicao.razao_social || 'Instituição';
    return nome.split(' ').filter(Boolean).slice(0, 2).map(parte => parte[0]).join('').toUpperCase();
}

// Desenha os cards das instituicoes aprovadas. O mesmo bloco atende a home e a pagina de instituicoes.
function renderizarCardsOngs(container, instituicoes, limite = null) {
    if (!container) return;

    const lista = limite ? instituicoes.slice(0, limite) : instituicoes;

    if (!lista.length) {
        container.innerHTML = '<div class="estado-lista">Parece que essa categoria está vazia...</div>';
        return;
    }

    container.innerHTML = lista.map(instituicao => {
        const categorias = Array.isArray(instituicao.categorias_aceitas) ? instituicao.categorias_aceitas : [];
        const cidade = [instituicao.cidade, instituicao.estado].filter(Boolean).join('/');
        const nome = instituicao.nome_publico || instituicao.nome_fantasia || instituicao.razao_social || 'Instituição';
        const logo = instituicao.logo_url
            ? `<img class="ong-card-logo" src="${textoSeguro(instituicao.logo_url)}" alt="Logo de ${textoSeguro(nome)}">`
            : `<div class="ong-card-logo">${textoSeguro(iniciaisInstituicao(instituicao))}</div>`;

        return `
            <article class="ong-card">
                <div class="ong-card-banner">${logo}</div>
                <div class="ong-card-body">
                    <h3>${textoSeguro(nome)}</h3>
                    <p class="ong-card-local">${cidade ? textoSeguro(cidade) : 'Localização não informada'}</p>
                    <p class="ong-card-desc">${textoSeguro(limitarTexto(instituicao.descricao || 'Instituição parceira da plataforma DEER.'))}</p>
                    <div class="ong-card-categorias">
                        ${categorias.length
                            ? categorias.slice(0, 4).map(categoria => {
                                const meta = categoriasDoacao[categoria];
                                return `<span>${meta ? `${iconeCategoriaHtml(meta)}${textoSeguro(meta.nome)}` : textoSeguro(categoria)}</span>`;
                            }).join('') + (categorias.length > 4 ? `<span style="background: var(--surface-strong); font-weight: 600;">+${categorias.length - 4}</span>` : '')
                            : '<span>Categorias em análise</span>'}
                    </div>
                    <button type="button" class="btn-card-contribuir" data-doar-instituicao data-instituicao-id="${textoSeguro(instituicao.id)}" data-instituicao-nome="${textoSeguro(nome)}">Contribuir</button>
                </div>
            </article>
        `;
    }).join('');
    aplicarRevealNosElementos(container.querySelectorAll('.ong-card'));
}

// Efeito leve de entrada ao rolar a pagina. Se o navegador nao suportar, o conteudo aparece normal.
function aplicarRevealNosElementos(elementos) {
    const lista = Array.from(elementos || []);
    if (!lista.length) return;

    lista.forEach((el, index) => {
        if (el.classList.contains('revelado')) return;
        el.classList.add('reveal-on-scroll');
        el.style.transitionDelay = `${Math.min(index % 6, 5) * 45}ms`;
    });

    if (!('IntersectionObserver' in window)) {
        lista.forEach(el => el.classList.add('revelado'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revelado');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.14 });

    lista.forEach(el => observer.observe(el));
}

// Busca apenas instituicoes aprovadas. O back-end ja filtra o que pode aparecer publicamente.
async function buscarInstituicoesAprovadas() {
    const response = await fetch(window.deerApi('/instituicoes'));
    if (!response.ok) throw new Error('Erro ao buscar instituições.');
    return response.json();
}

document.addEventListener('DOMContentLoaded', () => {
    // Quando o Mercado Pago redireciona de volta, ele adiciona pagamento=sucesso/falha/pendente na URL.
    const paramsPagamento = new URLSearchParams(window.location.search);
    const statusPagamento = paramsPagamento.get('pagamento');
    if (statusPagamento && window.mostrarAvisoGlobal) {
        const mensagens = {
            sucesso: ['Pagamento aprovado', 'Seu pagamento foi aprovado!!!', 'sucesso'],
            falha: ['Pagamento não concluído', 'Alguma coisa deu errado no seu pagamento...', 'erro'],
            pendente: ['Pagamento pendente', 'Seu pagamento está pendente...', 'erro']
        };
        const [titulo, mensagem, tipo] = mensagens[statusPagamento] || mensagens.pendente;
        window.mostrarAvisoGlobal(titulo, mensagem, tipo);

        // Depois de mostrar o aviso uma vez, limpamos a URL para o aviso nao voltar em todo reload.
        paramsPagamento.delete('pagamento');
        const novaQuery = paramsPagamento.toString();
        const novaUrl = `${window.location.pathname}${novaQuery ? `?${novaQuery}` : ''}${window.location.hash}`;
        window.history.replaceState({}, document.title, novaUrl);
    }

    // Aceita valores como 15, 15,50 ou 15.50 e bloqueia letras ou mais de duas casas decimais.
    function normalizarValorDoacao(valorDigitado) {
        const valorLimpo = valorDigitado.trim().replace(',', '.');

        if (!/^\d+(\.\d{1,2})?$/.test(valorLimpo)) {
            return null;
        }

        const valor = Number(valorLimpo);
        return Number.isFinite(valor) ? valor : null;
    }

    // Evita quebrar o front se o servidor responder HTML em vez de JSON durante algum erro de deploy.
    async function lerRespostaJson(response) {
        const texto = await response.text();

        try {
            return texto ? JSON.parse(texto) : {};
        } catch {
            return {
                error: 'O servidor respondeu em um formato inesperado. Verifique se o back-end está atualizado.'
            };
        }
    }

    // Modal inicial do fluxo de doacao: coleta valor e redireciona para o Checkout Pro do Mercado Pago.
    const abrirModalDoacao = (instituicaoId, instituicaoNome) => {
        let modal = document.getElementById('modal-doacao');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-doacao';
            modal.className = 'modal-desenvolvimento-overlay';
            modal.innerHTML = `
                <div class="modal-desenvolvimento" role="dialog" aria-modal="true" aria-labelledby="modal-doacao-titulo">
                    <h3 id="modal-doacao-titulo">Contribuir com dinheiro</h3>
                    <p id="modal-doacao-texto">Informe um valor para simular a doação.</p>
                    <label for="valor-doacao" style="display:block; margin-top: 16px; font-weight: 700;">Valor da doação</label>
                    <input id="valor-doacao" type="text" inputmode="decimal" autocomplete="off" placeholder="Ex: 25,00" style="width:100%; margin-top:8px; padding:12px 14px; border-radius:10px; border:1px solid var(--field-border); background:var(--input-bg); color:var(--dark-text);">
                    <span id="erro-doacao" style="display:none; color:var(--red-base); font-weight:700; margin-top:10px; font-size:.86rem;"></span>
                    <div style="display:flex; gap:12px; margin-top:22px;">
                        <button type="button" class="btn-fechar-modal-dev" style="flex:1;">Cancelar</button>
                        <button type="button" id="btn-confirmar-doacao" class="btn-card-contribuir" style="flex:1;">Continuar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('btn-fechar-modal-dev')) {
                    modal.classList.remove('ativo');
                }
            });
        }

        const inputValor = modal.querySelector('#valor-doacao');
        const erro = modal.querySelector('#erro-doacao');
        const texto = modal.querySelector('#modal-doacao-texto');
        const btnConfirmar = modal.querySelector('#btn-confirmar-doacao');

        texto.textContent = `Doação teste para ${instituicaoNome}.`;
        inputValor.value = '';
        erro.style.display = 'none';
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = 'Continuar';

        btnConfirmar.onclick = async () => {
            const valor = normalizarValorDoacao(inputValor.value);
            erro.style.display = 'none';

            if (!Number.isFinite(valor) || valor < 1) {
                erro.textContent = 'Informe um valor válido a partir de R$ 1,00, usando no máximo duas casas decimais.';
                erro.style.display = 'block';
                return;
            }

            btnConfirmar.disabled = true;
            btnConfirmar.textContent = 'Indo pro pagamento...';

            try {
                // O front so envia instituicao e valor. O back cria a preferencia usando o token do Mercado Pago.
                const response = await fetch(window.deerApi('/pagamentos/preferencia'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ instituicao_id: Number(instituicaoId), valor })
                });

                const resultado = await lerRespostaJson(response);

                if (!response.ok || !resultado.checkout_url) {
                    throw new Error(resultado.error || 'Erro ao continuar');
                }

                // A partir daqui o pagamento acontece no ambiente do Mercado Pago.
                window.location.href = resultado.checkout_url;
            } catch (error) {
                erro.textContent = error.message || 'Não foi possível continuar para o pagamento.';
                erro.style.display = 'block';
                btnConfirmar.disabled = false;
                btnConfirmar.textContent = 'Continuar';
            }
        };

        modal.classList.add('ativo');
        setTimeout(() => inputValor.focus(), 80);
    };

    // Delegacao de clique: funciona para cards criados depois que os dados chegaram do back-end.
    document.addEventListener('click', (e) => {
        const botaoDoacao = e.target.closest('[data-doar-instituicao]');
        if (botaoDoacao) {
            abrirModalDoacao(botaoDoacao.dataset.instituicaoId, botaoDoacao.dataset.instituicaoNome);
        }
    });

    // Cards de categoria da home levam para a pagina de instituicoes ja filtrada.
    document.querySelectorAll('.categoria-card[data-categoria]').forEach(card => {
        card.addEventListener('click', () => {
            window.location.href = caminhoPaginaOngs(card.dataset.categoria);
        });
    });

    document.querySelector('[data-ver-ongs]')?.addEventListener('click', () => {
        window.location.href = caminhoPaginaOngs();
    });

    document.querySelector('[data-scroll-ongs]')?.addEventListener('click', () => {
        document.getElementById('ongs-aprovadas')?.scrollIntoView({ behavior: 'smooth' });
    });
});

// Carrega instituicoes aprovadas para a home e para a pagina de listagem.
document.addEventListener('DOMContentLoaded', async () => {
    const homeGrid = document.getElementById('home-ongs-grid');
    const pageGrid = document.getElementById('ongs-grid');
    if (!homeGrid && !pageGrid) return;

    try {
        const instituicoes = await buscarInstituicoesAprovadas();

        if (homeGrid) {
            renderizarCardsOngs(homeGrid, instituicoes, 3);
        }

        if (pageGrid) {
            const params = new URLSearchParams(window.location.search);
            let categoriaAtual = params.get('categoria') || '';

            // Filtra pelo array categorias_aceitas que vem do banco.
            const aplicarFiltro = (categoria) => {
                const filtradas = categoria
                ? instituicoes.filter(instituicao => { 
                return Array.isArray(instituicao.categorias_aceitas) && 
               instituicao.categorias_aceitas.some(cat => cat.toLowerCase() === categoria.toLowerCase());
                })
                : instituicoes;

                document.querySelectorAll('.filtro-ong').forEach(btn => {
                    btn.classList.toggle('ativo', btn.dataset.categoria === categoria);
                });

                renderizarCardsOngs(pageGrid, filtradas);
            };

            document.querySelectorAll('.filtro-ong').forEach(btn => {
                btn.addEventListener('click', () => {
                    let categoria = btn.dataset.categoria || '';
                    
                    if (categoriaAtual === categoria) {
                    categoria = ''; 
                    }
                    const url = categoria ? `ongs.html?categoria=${encodeURIComponent(categoria)}` : 'ongs.html';
                    window.history.replaceState({}, '', url);
                    categoriaAtual = categoria;
                    aplicarFiltro(categoria);
                });
            });

            aplicarFiltro(categoriaAtual);
        }
    } catch (error) {
        console.error(error);
        const msg = '<div class="estado-lista">Não foi possível carregar as instituições. Verifique se o back-end está ligado.</div>';
        if (homeGrid) homeGrid.innerHTML = msg;
        if (pageGrid) pageGrid.innerHTML = msg;
    }
});

// Aplica a animacao de entrada em secoes estaticas da home.
document.addEventListener('DOMContentLoaded', () => {
    aplicarRevealNosElementos(document.querySelectorAll(
        '.como-funciona .passo, .categorias .categoria-card, .beneficios-deer .beneficio-card, .sobre-nos .sobre-texto'
    ));
});

// Consulta CEP pela BrasilAPI e preenche campos de endereco quando a API encontra os dados.
async function buscarCEP(cep, prefixo = '') {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cepLimpo}`);
        if (!response.ok) { habilitarCampos(prefixo); return; }
        
        const dados = await response.json();

        const setCampo = (id, val) => {
            const el = document.getElementById(prefixo + id);
            if (!el) return;
            el.value = val || '';
        };

        setCampo('rua', dados.street);
        setCampo('bairro', dados.neighborhood);
        setCampo('cidade', dados.city);
        setCampo('estado', dados.state);
        setCampo('complemento', dados.complement);

    } catch { habilitarCampos(prefixo); }
}

// Se a BrasilAPI falhar, liberamos os campos para preenchimento manual.
function habilitarCampos(prefixo = '') {
    ['rua', 'bairro', 'cidade', 'estado'].forEach(id => {
        const el = document.getElementById(prefixo + id);
        if (el) el.disabled = false;
    });
}

// Mascara visual do CEP e chamada automatica da consulta quando chega a 8 digitos.
function mascaraCEP(input, prefixo = '') {
    input.addEventListener('input', async () => {
        let v = input.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 5) v = v.replace(/(\d{5})(\d{1,3})/, '$1-$2');
        input.value = v;
        if (v.replace(/\D/g, '').length === 8) await buscarCEP(v, prefixo);
    });
}

// Definicao das cores dos temas. Alterar aqui reflete em todas as paginas que usam as variaveis CSS.
const temasPlataforma = {
    claro: {
        pageBg: '#FAFAFA',
        surface: 'rgba(255, 255, 255, 0.65)',
        surfaceStrong: 'rgba(255, 255, 255, 0.92)',
        surfaceHover: 'rgba(255, 255, 255, 0.9)',
        border: '#E2E6EC',
        fieldBorder: '#DADDE3',
        inputBg: 'rgba(255, 255, 255, 0.9)',
        text: '#2D2D2D',
        muted: '#5F6368',
        footer: '#2D2D2D',
        shadow: '0 4px 15px rgba(229, 57, 53, 0.2)',
        backgroundImage: `
            radial-gradient(circle at 0% 0%, rgba(229, 57, 53, 0.08) 0%, transparent 55%),
            radial-gradient(circle at 100% 100%, rgba(251, 140, 0, 0.10) 0%, transparent 55%)
        `
    },
    escuro: {
        pageBg: '#101214',
        surface: 'rgba(31, 35, 38, 0.72)',
        surfaceStrong: 'rgba(24, 27, 30, 0.94)',
        surfaceHover: 'rgba(40, 45, 49, 0.96)',
        border: 'rgba(255, 255, 255, 0.10)',
        fieldBorder: '#32383F',
        inputBg: 'rgba(16, 18, 20, 0.86)',
        text: '#F4F4F5',
        muted: '#B8BEC5',
        footer: '#0B0D0F',
        shadow: '0 8px 24px rgba(0, 0, 0, 0.32)',
        backgroundImage: `
            radial-gradient(circle at 0% 0%, rgba(229, 57, 53, 0.16) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(251, 140, 0, 0.10) 0%, transparent 50%)
        `
    }
};

// Centraliza a aplicacao do tema para todas as paginas usarem as mesmas variaveis CSS.
window.aplicarTemaPlataforma = function(tema = 'claro') {
    const nomeTema = tema === 'escuro' ? 'escuro' : 'claro';
    const config = temasPlataforma[nomeTema];
    const root = document.documentElement;

    root.dataset.theme = nomeTema;
    root.style.setProperty('--red-base', '#E53935');
    root.style.setProperty('--red-hover', '#C62828');
    root.style.setProperty('--page-bg', config.pageBg);
    root.style.setProperty('--surface', config.surface);
    root.style.setProperty('--surface-strong', config.surfaceStrong);
    root.style.setProperty('--surface-hover', config.surfaceHover);
    root.style.setProperty('--border-color', config.border);
    root.style.setProperty('--field-border', config.fieldBorder);
    root.style.setProperty('--input-bg', config.inputBg);
    root.style.setProperty('--dark-text', config.text);
    root.style.setProperty('--gray-text', config.muted);
    root.style.setProperty('--theme-shadow', config.shadow);

    if (document.body) {
        document.body.dataset.theme = nomeTema;
        document.body.style.backgroundColor = config.pageBg;
        document.body.style.backgroundImage = config.backgroundImage;
    }

    try {
        localStorage.setItem('deer_tema', nomeTema);
    } catch {}
};

// Ao abrir a pagina, escolhe o tema salvo no usuario ou no navegador.
document.addEventListener('DOMContentLoaded', () => {
    const sessaoAtual = JSON.parse(sessionStorage.getItem('deer_sessao'));
    let temaSalvo = 'claro';

    if (sessaoAtual && sessaoAtual.tema_preferido) {
        temaSalvo = sessaoAtual.tema_preferido;
    }

    try {
        temaSalvo = sessaoAtual?.tema_preferido || localStorage.getItem('deer_tema') || 'claro';
    } catch {}

    window.aplicarTemaPlataforma(temaSalvo);
});