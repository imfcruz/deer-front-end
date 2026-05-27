const categoriasInstituicao = {
    alimentos: '🍎 Alimentos',
    roupas: '👕 Roupas',
    higiene: '🧴 Higiene e limpeza',
    educacao: '📚 Educação',
    brinquedos: '🧸 Brinquedos',
    pets: '🐾 Pets',
    moveis: '🪑 Móveis e utensílios'
};

const tiposPix = {
    cpf: 'CPF',
    cnpj: 'CNPJ',
    email: 'E-mail',
    telefone: 'Telefone',
    aleatoria: 'Aleatória'
};

// Helpers de formatação usados nas máscaras e nas validações do formulário.
function limparNumero(valor = '') {
    return String(valor).replace(/\D/g, '');
}

function tipoPixValido(tipo = '') {
    return Object.keys(tiposPix).includes(tipo);
}

function formatarCPF(valor = '') {
    let v = limparNumero(valor).slice(0, 11);
    if (v.length > 9) v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/^(\d{3})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/^(\d{3})(\d{0,3}).*/, '$1.$2');
    return v;
}

function formatarCNPJ(valor = '') {
    let v = limparNumero(valor).slice(0, 14);
    if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/, '$1.$2.$3/$4-$5');
    else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/, '$1.$2.$3/$4');
    else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,3}).*/, '$1.$2');
    return v;
}

function formatarTelefone(valor = '') {
    let v = limparNumero(valor).slice(0, 11);
    if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    else if (v.length > 0) v = v.replace(/^(\d{0,2}).*/, '($1');
    return v;
}

function normalizarChaveAleatoria(valor = '') {
    return String(valor)
        .toLowerCase()
        .replace(/[^0-9a-f-]/g, '')
        .slice(0, 36);
}

function validarChavePix(tipo, chave) {
    const valor = String(chave || '').trim();
    if (!valor) return 'Informe a chave Pix.';

    if (tipo === 'cpf' && limparNumero(valor).length !== 11) return 'Informe um CPF com 11 dígitos.';
    if (tipo === 'cnpj' && limparNumero(valor).length !== 14) return 'Informe um CNPJ com 14 dígitos.';
    if (tipo === 'telefone' && limparNumero(valor).length !== 11) return 'Informe um celular com DDD e 11 dígitos.';
    if (tipo === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) return 'Informe um e-mail válido.';
    if (tipo === 'email' && valor.length > 120) return 'O e-mail deve ter no máximo 120 caracteres.';

    const uuidPix = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const hexPix = /^[0-9a-f]{32}$/i;
    if (tipo === 'aleatoria' && !uuidPix.test(valor) && !hexPix.test(valor)) {
        return 'Informe uma chave aleatória válida.';
    }

    return '';
}

// Protege a tela de visualização contra textos vindos do banco com caracteres de HTML.
function textoSeguro(valor = '') {
    return String(valor || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function aplicarMascaraCNPJ(input) {
    input.addEventListener('input', () => {
        let v = limparNumero(input.value).slice(0, 14);
        if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/, '$1.$2.$3/$4-$5');
        else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/, '$1.$2.$3/$4');
        else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
        else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,3}).*/, '$1.$2');
        input.value = v;
    });
}

function aplicarMascaraCEPInstituicao(input) {
    input.addEventListener('input', () => {
        let v = limparNumero(input.value).slice(0, 8);
        if (v.length > 5) v = v.replace(/^(\d{5})(\d{0,3}).*/, '$1-$2');
        input.value = v;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-instituicao');
    if (!form) return;

    const sessao = JSON.parse(sessionStorage.getItem('deer_sessao'));
    if (!sessao) {
        window.location.href = 'login.html';
        return;
    }

    let etapaAtual = 1;
    let cnpjConsultado = false;
    let enderecoConsultado = false;
    let enderecoLiberado = false;
    let cepExtraidoCNPJ = '';

    const campos = {
        cnpj: document.getElementById('ong-cnpj'),
        razaoSocial: document.getElementById('ong-razao-social'),
        nomeFantasia: document.getElementById('ong-nome-fantasia'),
        situacao: document.getElementById('ong-situacao'),
        nomePublico: document.getElementById('ong-nome-publico'),
        cep: document.getElementById('ong-cep'),
        rua: document.getElementById('ong-rua'),
        bairro: document.getElementById('ong-bairro'),
        cidade: document.getElementById('ong-cidade'),
        estado: document.getElementById('ong-estado'),
        numero: document.getElementById('ong-numero'),
        complemento: document.getElementById('ong-complemento'),
        descricao: document.getElementById('ong-descricao'),
        chavePix: document.getElementById('ong-chave-pix'),
        tipoChavePix: document.getElementById('ong-tipo-chave-pix')
    };

    const toast = document.getElementById('toast-ong');
    const btnEnviar = document.getElementById('btn-enviar-instituicao');
    const modalCancelamento = document.getElementById('modal-cancelar-solicitacao');
    const btnFecharCancelamento = document.getElementById('btn-fechar-cancelamento');
    const btnConfirmarCancelamento = document.getElementById('btn-confirmar-cancelamento');
    let acaoConfirmarCancelamento = null;

    aplicarMascaraCNPJ(campos.cnpj);
    aplicarMascaraCEPInstituicao(campos.cep);

    // O endereço vem do CNPJ bloqueado por padrão; só libera se o usuário pedir correção.
    function alternarCamposEndereco(liberado) {
        enderecoLiberado = liberado;
        ['cep', 'numero', 'rua', 'bairro', 'cidade', 'estado'].forEach(campo => {
            campos[campo].disabled = !liberado;
            campos[campo].classList.toggle('campo-liberado', liberado);
        });

        const btnCorrigir = document.getElementById('btn-corrigir-endereco');
        if (btnCorrigir) {
            btnCorrigir.classList.toggle('ativo', liberado);
            btnCorrigir.textContent = liberado ? 'Endereço liberado para edição' : 'Corrigir endereço';
        }
    }

    alternarCamposEndereco(false);

    // Se o CEP for alterado manualmente, salvamos a observação para análise interna.
    function obterObservacaoEndereco() {
        const cepAtual = limparNumero(campos.cep.value);
        if (!cepExtraidoCNPJ || !cepAtual || cepAtual === cepExtraidoCNPJ) return '';
        return `O endereço foi corrigido durante o cadastro. CEP retornado pela consulta do CNPJ: ${cepExtraidoCNPJ.replace(/^(\d{5})(\d{3})$/, '$1-$2')}. CEP informado no formulário: ${campos.cep.value}.`;
    }

    // Cada tipo de chave Pix muda placeholder, limite e máscara do campo seguinte.
    function configurarCampoChavePix(limpar = false) {
        const tipo = campos.tipoChavePix.value;
        const configs = {
            cpf: { placeholder: '000.000.000-00', maxLength: 14, inputMode: 'numeric' },
            cnpj: { placeholder: '00.000.000/0000-00', maxLength: 18, inputMode: 'numeric' },
            telefone: { placeholder: '(00) 00000-0000', maxLength: 15, inputMode: 'numeric' },
            email: { placeholder: 'email@exemplo.com', maxLength: 120, inputMode: 'email' },
            aleatoria: { placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', maxLength: 36, inputMode: 'text' }
        };

        const config = configs[tipo] || { placeholder: 'Selecione o tipo da chave Pix', maxLength: 120, inputMode: 'text' };
        campos.chavePix.placeholder = config.placeholder;
        campos.chavePix.maxLength = config.maxLength;
        campos.chavePix.inputMode = config.inputMode;
        campos.chavePix.disabled = !tipo;

        if (limpar) campos.chavePix.value = '';
        aplicarMascaraChavePix();
        limparErroCampo('erro-ong-chave-pix');
    }

    function aplicarMascaraChavePix() {
        const tipo = campos.tipoChavePix.value;
        if (tipo === 'cpf') campos.chavePix.value = formatarCPF(campos.chavePix.value);
        else if (tipo === 'cnpj') campos.chavePix.value = formatarCNPJ(campos.chavePix.value);
        else if (tipo === 'telefone') campos.chavePix.value = formatarTelefone(campos.chavePix.value);
        else if (tipo === 'aleatoria') campos.chavePix.value = normalizarChaveAleatoria(campos.chavePix.value);
        else if (tipo === 'email') campos.chavePix.value = campos.chavePix.value.trim().slice(0, 120);
    }

    function abrirModalCancelamento(callback) {
        acaoConfirmarCancelamento = callback;
        modalCancelamento?.classList.add('ativo');
        modalCancelamento?.setAttribute('aria-hidden', 'false');
    }

    function fecharModalCancelamento() {
        modalCancelamento?.classList.remove('ativo');
        modalCancelamento?.setAttribute('aria-hidden', 'true');
        acaoConfirmarCancelamento = null;
    }

    btnFecharCancelamento?.addEventListener('click', fecharModalCancelamento);
    modalCancelamento?.addEventListener('click', (e) => {
        if (e.target === modalCancelamento) fecharModalCancelamento();
    });
    btnConfirmarCancelamento?.addEventListener('click', () => {
        if (typeof acaoConfirmarCancelamento === 'function') acaoConfirmarCancelamento();
    });

    function mostrarErroGlobal(msg) {
        toast.textContent = msg;
        toast.classList.add('visivel');
    }

    function limparErroGlobal() {
        toast.classList.remove('visivel');
    }

    function mostrarErroCampo(id, msg) {
        const erro = document.getElementById(id);
        if (!erro) return;
        if (msg) erro.textContent = msg;
        erro.classList.add('visivel');
    }

    function limparErroCampo(id) {
        document.getElementById(id)?.classList.remove('visivel');
    }

    function irParaEtapa(etapa) {
        etapaAtual = etapa;
        limparErroGlobal();

        for (let i = 1; i <= 3; i++) {
            document.getElementById(`ong-etapa-${i}`).classList.toggle('ativo', i === etapa);
            const step = document.getElementById(`ong-step-${i}`);
            step.classList.toggle('ativo', i === etapa);
            step.classList.toggle('concluido', i < etapa);
        }
    }

    function statusTexto(status) {
        return {
            pendente: 'Em análise',
            aprovada: 'Aprovada',
            rejeitada: 'Rejeitada'
        }[status] || status || 'Em análise';
    }

    // Quando já existe solicitação, a página vira uma tela de acompanhamento em vez de novo cadastro.
    function renderizarSolicitacao(instituicao) {
        const topo = document.querySelector('.instituicao-topo');
        const progress = document.querySelector('.progress-ong');
        const area = document.querySelector('.instituicao-form-area');
        const linkVoltar = document.querySelector('.link-voltar-ong');
        const status = instituicao.status || 'pendente';
        const categorias = Array.isArray(instituicao.categorias_aceitas) ? instituicao.categorias_aceitas : [];

        topo.innerHTML = `
            <span class="instituicao-tag">Solicitação de instituição</span>
            <h1>${textoSeguro(instituicao.nome_publico || instituicao.razao_social || 'Instituição')}</h1>
            <p>Acompanhe abaixo os dados enviados e o status atual da análise.</p>
        `;

        progress.style.display = 'none';
        if (linkVoltar) linkVoltar.style.display = 'none';

        area.innerHTML = `
            <div class="toast-ong" id="toast-ong-view"></div>
            <div class="solicitacao-view">
                <span class="solicitacao-status ${textoSeguro(status)}">${textoSeguro(statusTexto(status))}</span>

                <div class="solicitacao-bloco">
                    <h3>Dados oficiais</h3>
                    <div class="solicitacao-grid">
                        <div class="solicitacao-campo"><span>CNPJ</span><strong>${textoSeguro(instituicao.cnpj)}</strong></div>
                        <div class="solicitacao-campo"><span>Situação</span><strong>${textoSeguro(instituicao.situacao_cadastral || 'Não informado')}</strong></div>
                        <div class="solicitacao-campo full"><span>Razão social</span><strong>${textoSeguro(instituicao.razao_social || 'Não informado')}</strong></div>
                        <div class="solicitacao-campo full"><span>Nome público</span><strong>${textoSeguro(instituicao.nome_publico || 'Não informado')}</strong></div>
                    </div>
                </div>

                <div class="solicitacao-bloco">
                    <h3>Endereço</h3>
                    <div class="solicitacao-grid">
                        <div class="solicitacao-campo full"><span>Rua</span><strong>${textoSeguro(instituicao.rua || 'Não informado')}, ${textoSeguro(instituicao.numero || 'S/N')}</strong></div>
                        <div class="solicitacao-campo"><span>Bairro</span><strong>${textoSeguro(instituicao.bairro || 'Não informado')}</strong></div>
                        <div class="solicitacao-campo"><span>Cidade/UF</span><strong>${textoSeguro(instituicao.cidade || 'Não informado')}/${textoSeguro(instituicao.estado || '')}</strong></div>
                        <div class="solicitacao-campo full"><span>Complemento</span><strong>${textoSeguro(instituicao.complemento || 'Não informado')}</strong></div>
                        ${instituicao.observacao_endereco
                            ? `<div class="solicitacao-campo full"><span>Observação da análise</span><p>${textoSeguro(instituicao.observacao_endereco)}</p></div>`
                            : ''}
                    </div>
                </div>

                <div class="solicitacao-bloco">
                    <h3>Perfil público</h3>
                    <div class="solicitacao-grid">
                        <div class="solicitacao-campo full"><span>Descrição</span><p>${textoSeguro(instituicao.descricao || 'Não informado')}</p></div>
                        <div class="solicitacao-campo full">
                            <span>Categorias aceitas</span>
                            <div class="solicitacao-categorias">
                                ${categorias.length
                                    ? categorias.map(categoria => `<span>${textoSeguro(categoriasInstituicao[categoria] || categoria)}</span>`).join('')
                                    : '<span>Nenhuma categoria informada</span>'}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="solicitacao-bloco">
                    <h3>Dados Pix</h3>
                    <div class="solicitacao-grid">
                        <div class="solicitacao-campo"><span>Tipo da chave</span><strong>${textoSeguro(tiposPix[instituicao.tipo_chave_pix] || 'Não informado')}</strong></div>
                        <div class="solicitacao-campo"><span>Chave Pix</span><strong>${textoSeguro(instituicao.chave_pix || 'Não informado')}</strong></div>
                        <div class="solicitacao-campo full"><span>Visibilidade</span><p>Esses dados ficam guardados para a análise interna e não aparecem publicamente nesta fase.</p></div>
                    </div>
                </div>

                <div class="solicitacao-actions ${status === 'pendente' ? '' : 'unica'}">
                    <a href="perfil.html" class="btn-ong-secondary">Voltar ao perfil</a>
                    ${status === 'pendente'
                        ? '<button type="button" class="btn-ong-danger" id="btn-cancelar-solicitacao">Cancelar envio</button>'
                        : ''}
                </div>
            </div>
        `;

        const btnCancelar = document.getElementById('btn-cancelar-solicitacao');
        if (btnCancelar) {
            const mostrarErroSolicitacao = (msg) => {
                const toastView = document.getElementById('toast-ong-view');
                if (!toastView) return;
                toastView.textContent = msg;
                toastView.classList.add('visivel');
            };

            btnCancelar.addEventListener('click', async () => {
                abrirModalCancelamento(async () => {
                    fecharModalCancelamento();

                    btnCancelar.disabled = true;
                    btnCancelar.textContent = 'Cancelando...';

                    try {
                        const response = await fetch(window.deerApi(`/instituicoes/${instituicao.id}`), {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ usuario_id: sessao.id })
                        });

                        const resultado = await response.json().catch(() => ({}));

                        if (response.ok) {
                            window.location.href = 'perfil.html';
                        } else {
                            mostrarErroSolicitacao(resultado.error || 'Erro ao cancelar solicitação.');
                            btnCancelar.disabled = false;
                            btnCancelar.textContent = 'Cancelar envio';
                        }
                    } catch {
                        mostrarErroSolicitacao('Servidor indisponível. Tente novamente.');
                        btnCancelar.disabled = false;
                        btnCancelar.textContent = 'Cancelar envio';
                    }
                });
            });
        }
    }

    async function carregarSolicitacaoExistente() {
        try {
            const response = await fetch(window.deerApi(`/instituicoes/usuario/${sessao.id}`));
            const resultado = await response.json();

            if (response.ok && resultado.instituicao) {
                renderizarSolicitacao(resultado.instituicao);
            }
        } catch (error) {
            console.error('Erro ao buscar solicitação existente:', error);
        }
    }

    carregarSolicitacaoExistente();

    // Consulta dados públicos do CNPJ na BrasilAPI para reduzir digitação e evitar dados inventados.
    async function buscarCNPJ() {
        const cnpj = limparNumero(campos.cnpj.value);
        cnpjConsultado = false;
        limparErroCampo('erro-ong-cnpj');

        if (cnpj.length !== 14) {
            mostrarErroCampo('erro-ong-cnpj', 'Informe um CNPJ com 14 dígitos.');
            return;
        }

        try {
            campos.razaoSocial.value = 'Buscando...';
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
            if (!response.ok) throw new Error('CNPJ não encontrado.');
            const dados = await response.json();

            campos.razaoSocial.value = dados.razao_social || '';
            campos.nomeFantasia.value = dados.nome_fantasia || '';
            campos.situacao.value = dados.descricao_situacao_cadastral || dados.situacao_cadastral || '';
            campos.nomePublico.value = dados.nome_fantasia || dados.razao_social || '';

            if (dados.cep) {
                campos.cep.value = String(dados.cep).replace(/^(\d{5})(\d{3})$/, '$1-$2');
                cepExtraidoCNPJ = limparNumero(dados.cep);
            } else {
                cepExtraidoCNPJ = '';
            }
            if (dados.logradouro) campos.rua.value = dados.logradouro;
            if (dados.bairro) campos.bairro.value = dados.bairro;
            if (dados.municipio) campos.cidade.value = dados.municipio;
            if (dados.uf) campos.estado.value = dados.uf;
            if (dados.numero) campos.numero.value = dados.numero;

            alternarCamposEndereco(false);
            cnpjConsultado = true;
            if (campos.cep.value && campos.rua.value) enderecoConsultado = true;
        } catch {
            campos.razaoSocial.value = '';
            campos.nomeFantasia.value = '';
            campos.situacao.value = '';
            cepExtraidoCNPJ = '';
            mostrarErroCampo('erro-ong-cnpj', 'CNPJ não encontrado. Verifique e tente novamente.');
        }
    }

    async function buscarCEPInstituicao() {
        const cep = limparNumero(campos.cep.value);
        enderecoConsultado = false;
        limparErroCampo('erro-ong-cep');

        if (cep.length !== 8) {
            mostrarErroCampo('erro-ong-cep', 'Informe um CEP com 8 dígitos.');
            return;
        }

        try {
            const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
            if (!response.ok) throw new Error('CEP não encontrado.');
            const dados = await response.json();

            campos.rua.value = dados.street || '';
            campos.bairro.value = dados.neighborhood || '';
            campos.cidade.value = dados.city || '';
            campos.estado.value = dados.state || '';
            enderecoConsultado = true;

            alternarCamposEndereco(enderecoLiberado);
        } catch {
            mostrarErroCampo('erro-ong-cep', 'CEP não encontrado. Você pode corrigir o endereço manualmente.');
            alternarCamposEndereco(true);
        }
    }

    function validarEtapa1() {
        let ok = true;
        if (limparNumero(campos.cnpj.value).length !== 14 || !cnpjConsultado) {
            mostrarErroCampo('erro-ong-cnpj', 'Consulte um CNPJ válido antes de continuar.');
            ok = false;
        }
        if (!campos.nomePublico.value.trim()) {
            mostrarErroCampo('erro-ong-nome-publico', 'Informe o nome público da instituição.');
            ok = false;
        }
        return ok;
    }

    function validarEtapa2() {
        let ok = true;
        if (limparNumero(campos.cep.value).length !== 8 || !campos.rua.value.trim() || !campos.cidade.value.trim()) {
            mostrarErroCampo('erro-ong-cep', 'Informe um endereço válido.');
            ok = false;
        }
        if (!campos.numero.value.trim()) {
            mostrarErroCampo('erro-ong-numero', 'Informe o número.');
            ok = false;
        }
        return ok;
    }

    function categoriasSelecionadas() {
        return Array.from(document.querySelectorAll('.categoria-check input:checked')).map(input => input.value);
    }

    function validarEtapa3() {
        let ok = true;
        if (campos.descricao.value.trim().length < 20) {
            mostrarErroCampo('erro-ong-descricao', 'A descrição deve ter pelo menos 20 caracteres.');
            ok = false;
        }
        if (categoriasSelecionadas().length === 0) {
            mostrarErroCampo('erro-ong-categorias', 'Selecione pelo menos uma categoria.');
            ok = false;
        }
        const tipoPix = campos.tipoChavePix.value.trim().toLowerCase();
        if (!tipoPixValido(tipoPix)) {
            mostrarErroCampo('erro-ong-tipo-chave-pix', 'Selecione o tipo da chave Pix.');
            ok = false;
        }
        const erroChavePix = validarChavePix(tipoPix, campos.chavePix.value);
        if (erroChavePix) {
            mostrarErroCampo('erro-ong-chave-pix', erroChavePix);
            ok = false;
        }
        return ok;
    }

    campos.cnpj.addEventListener('blur', buscarCNPJ);
    campos.cep.addEventListener('blur', buscarCEPInstituicao);
    campos.cep.addEventListener('input', () => {
        limparErroCampo('erro-ong-cep');
    });

    campos.cnpj.addEventListener('input', () => {
        cnpjConsultado = false;
        limparErroCampo('erro-ong-cnpj');
    });

    campos.nomePublico.addEventListener('input', () => limparErroCampo('erro-ong-nome-publico'));
    campos.numero.addEventListener('input', () => limparErroCampo('erro-ong-numero'));
    campos.descricao.addEventListener('input', () => {
        limparErroCampo('erro-ong-descricao');
        document.getElementById('contador-descricao-ong').textContent = campos.descricao.value.length;
    });
    campos.tipoChavePix.addEventListener('change', () => {
        limparErroCampo('erro-ong-tipo-chave-pix');
        configurarCampoChavePix(true);
    });
    campos.chavePix.addEventListener('input', () => {
        aplicarMascaraChavePix();
        limparErroCampo('erro-ong-chave-pix');
    });

    configurarCampoChavePix();

    document.querySelectorAll('.categoria-check input').forEach(input => {
        input.addEventListener('change', () => limparErroCampo('erro-ong-categorias'));
    });

    document.getElementById('btn-corrigir-endereco').addEventListener('click', () => {
        alternarCamposEndereco(true);
    });

    document.getElementById('btn-ong-next-1').addEventListener('click', () => {
        if (validarEtapa1()) irParaEtapa(2);
    });

    document.getElementById('btn-ong-next-2').addEventListener('click', () => {
        if (validarEtapa2()) irParaEtapa(3);
    });

    document.getElementById('btn-ong-back-2').addEventListener('click', () => irParaEtapa(1));
    document.getElementById('btn-ong-back-3').addEventListener('click', () => irParaEtapa(2));

    // Envia a solicitação ao back-end; ela começa como pendente e só aparece publicamente após aprovação.
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        limparErroGlobal();

        if (!validarEtapa3()) return;

        btnEnviar.disabled = true;
        btnEnviar.textContent = 'Enviando...';

        const dados = {
            usuario_id: sessao.id,
            cnpj: limparNumero(campos.cnpj.value),
            razao_social: campos.razaoSocial.value,
            nome_fantasia: campos.nomeFantasia.value,
            nome_publico: campos.nomePublico.value.trim(),
            situacao_cadastral: campos.situacao.value,
            cep: campos.cep.value,
            rua: campos.rua.value,
            bairro: campos.bairro.value,
            cidade: campos.cidade.value,
            estado: campos.estado.value,
            numero: campos.numero.value.trim(),
            complemento: campos.complemento.value.trim() || null,
            descricao: campos.descricao.value.trim(),
            categorias_aceitas: categoriasSelecionadas(),
            chave_pix: campos.chavePix.value.trim(),
            tipo_chave_pix: campos.tipoChavePix.value.trim().toLowerCase()
        };

        const observacaoEndereco = obterObservacaoEndereco();
        if (observacaoEndereco) dados.observacao_endereco = observacaoEndereco;

        try {
            const response = await fetch(window.deerApi('/instituicoes'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            const resultado = await response.json();

            if (response.ok) {
                document.getElementById('pop-up-sucesso')?.classList.add('show');
                setTimeout(() => {
                    window.location.href = 'perfil.html';
                }, 1800);
            } else if (response.status === 409) {
                mostrarErroGlobal('Você já possui uma instituição vinculada a este perfil.');
            } else {
                mostrarErroGlobal(resultado.error || 'Erro ao enviar instituição para análise.');
            }
        } catch {
            mostrarErroGlobal('Servidor indisponível. Verifique se o back-end está ligado.');
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Enviar para análise';
        }
    });
});
