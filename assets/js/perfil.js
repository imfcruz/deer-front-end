// Lógica da página de perfil: dados pessoais, tema, endereço, instituição e exclusão de conta.

document.addEventListener('DOMContentLoaded', () => {

   const sessao = JSON.parse(sessionStorage.getItem('deer_sessao'));
   //if (!sessao) { window.location.href = '../pages/login.html'; return; }
    if (sessao.senha) {
        delete sessao.senha;
        sessionStorage.setItem('deer_sessao', JSON.stringify(sessao));
    }

    // essas variaveis são usadas em varias partes do codigo, então foram definidas aqui
    const inputHex = document.getElementById('input-hex');
    const headerEl = document.getElementById('perfil-header');
    const painel = document.getElementById('banner-color-panel');
    const btnEditarBanner = document.getElementById('btn-editar-banner');

    // helpers
    function mostrarToast(id) {
        const toast = document.getElementById(id);
        if (!toast) return;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function mostrarAviso(titulo, mensagem, tipo = 'erro') {
        if (window.mostrarAvisoGlobal) {
            window.mostrarAvisoGlobal(titulo, mensagem, tipo);
            return;
        }
        const toast = document.getElementById(tipo === 'sucesso' ? 'pop-up-sucesso' : 'pop-up-erro');
        if (toast) {
            toast.textContent = mensagem;
            mostrarToast(toast.id);
        }
    }

    function textoSeguro(valor = '') {
        return String(valor || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function corEhClara(cor) {
        const hex = cor.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const luminosidade = (r * 299 + g * 587 + b * 114) / 1000;
        return luminosidade > 180;
    }

    function aplicarCorBanner(cor) {
        if (!/^#[0-9A-Fa-f]{6}$/.test(cor)) return;
        const corNormalizada = cor.toUpperCase();
        const bannerClaro = corEhClara(corNormalizada);
        headerEl.style.background = corNormalizada;
        headerEl.classList.toggle('banner-claro', bannerClaro);
        headerEl.style.setProperty('--banner-btn-bg', bannerClaro ? 'rgba(255,255,255,0.86)' : 'rgba(255,255,255,0.2)');
        headerEl.style.setProperty('--banner-btn-bg-hover', bannerClaro ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.35)');
        headerEl.style.setProperty('--banner-btn-border', bannerClaro ? 'rgba(24,33,47,0.22)' : 'rgba(255,255,255,0.4)');
        headerEl.style.setProperty('--banner-btn-border-hover', bannerClaro ? 'rgba(229,57,53,0.45)' : 'rgba(255,255,255,0.55)');
        headerEl.style.setProperty('--banner-btn-color', bannerClaro ? '#18212f' : '#ffffff');
        headerEl.style.setProperty('--banner-btn-shadow', bannerClaro ? '0 6px 18px rgba(24,33,47,0.14)' : 'none');
        headerEl.style.setProperty('--banner-avatar-bg', bannerClaro ? 'rgba(24,33,47,0.08)' : 'rgba(255,255,255,0.25)');
        headerEl.style.setProperty('--banner-avatar-border', bannerClaro ? 'rgba(24,33,47,0.2)' : '#ffffff');
        headerEl.style.setProperty('--banner-avatar-color', bannerClaro ? '#18212f' : '#ffffff');
        inputHex.value = corNormalizada;
        document.querySelectorAll('.cor-rapida').forEach(btn => {
            btn.classList.toggle('selecionada', btn.dataset.cor.toUpperCase() === corNormalizada);
        });
    }

    function forcarCpfDesabilitado() {
        const cpf = document.getElementById('edit-cpf');
        if (cpf) cpf.disabled = true;
    }

    // preenche os dados do perfil com as infos de sessao
    // Atualiza a tela com os dados mais recentes do usuário.
    function preencherPerfil(usuario) {
        const avatar = document.getElementById('perfil-avatar');
        const iniciais = usuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

        if (usuario.perfil_url) {
            avatar.innerHTML = `<img src="${textoSeguro(usuario.perfil_url)}" alt="Foto de perfil" class="perfil-avatar-img">`;
        } else {
            avatar.innerHTML = `<span>${textoSeguro(iniciais)}</span>`;
        }

        // texto do overlay muda conforme tem foto ou não
        const overlaySpan = avatar.parentElement.querySelector('.avatar-overlay span');
        if (overlaySpan) {
            overlaySpan.innerHTML = usuario.perfil_url ? '📷<br>Alterar foto' : '📷<br>Adicionar foto';
        }

        // banner
        if (usuario.banner_cor) {
            aplicarCorBanner(usuario.banner_cor);
        }

        document.getElementById('header-nome').textContent = usuario.nome;
        document.getElementById('header-email').textContent = usuario.email;
        document.getElementById('edit-nome').value = usuario.nome;
        document.getElementById('edit-cpf').value = usuario.cpf || '';
        document.getElementById('edit-telefone').value = usuario.telefone || '';
        document.getElementById('edit-email').value = usuario.email;
        document.getElementById('edit-senha').value = '';

        const bioEl = document.getElementById('edit-biografia');
        bioEl.value = usuario.biografia || '';
        document.getElementById('contador-bio').textContent = bioEl.value.length;

        forcarCpfDesabilitado();
    }

    preencherPerfil(sessao);
    olhinho('edit-senha');
    setTimeout(() => {
        const senhaPerfil = document.getElementById('edit-senha');
        if (senhaPerfil && document.activeElement !== senhaPerfil) senhaPerfil.value = '';
    }, 250);
    setTimeout(() => headerEl.style.transition = 'background 0.4s ease', 100);

    function marcarTemaAtivo(tema) {
        document.querySelectorAll('.tema-opcao').forEach(btn => {
            btn.classList.toggle('ativo', btn.dataset.tema === tema);
        });
    }

    let temaAtual = sessao.tema_preferido || 'claro';
    try {
        temaAtual = sessao.tema_preferido || localStorage.getItem('deer_tema') || 'claro';
    } catch {}
    marcarTemaAtivo(temaAtual);

    // O tema é salvo no banco para continuar igual depois de logout/login.
    document.querySelectorAll('.tema-opcao').forEach(btn => {
        btn.addEventListener('click', async () => {
            const tema = btn.dataset.tema;
            if (window.aplicarTemaPlataforma) window.aplicarTemaPlataforma(tema);
            marcarTemaAtivo(tema);

            try {
                const response = await fetch(window.deerApi(`/usuarios/${sessao.id}`), {
                    method: 'PUT',
                    headers: window.deerAuthHeaders({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({ tema_preferido: tema })
                });

                if (response.ok) {
                    Object.assign(sessao, { tema_preferido: tema });
                    sessionStorage.setItem('deer_sessao', JSON.stringify(sessao));
                } else {
                    mostrarToast('pop-up-erro');
                }
            } catch {
                mostrarToast('pop-up-erro');
            }
        });
    });

    // Mostra o resumo da instituição vinculada, quando o usuário já enviou uma solicitação.
    async function carregarInstituicaoVinculada() {
        const box = document.getElementById('instituicao-box');
        if (!box) return;

        try {
            const response = await fetch(window.deerApi(`/instituicoes/usuario/${sessao.id}`), {
                headers: window.deerAuthHeaders()
            });
            const resultado = await response.json();

            if (!response.ok) throw new Error(resultado.error || 'Erro ao buscar instituição.');

            if (!resultado.instituicao) return;

            const instituicao = resultado.instituicao;
            const status = instituicao.status || 'pendente';
            const textoStatus = {
                pendente: 'Em análise',
                aprovada: 'Aprovada',
                rejeitada: 'Rejeitada'
            }[status] || status;

            box.innerHTML = `
                <span class="instituicao-status ${textoSeguro(status)}">${textoSeguro(textoStatus)}</span>
                <h4>${textoSeguro(instituicao.nome_publico || instituicao.razao_social || 'Instituição vinculada')}</h4>
                <p>${status === 'aprovada'
                    ? 'Sua instituição já foi aprovada e poderá aparecer na página de instituições.'
                    : status === 'rejeitada'
                        ? 'Sua solicitação foi rejeitada. Revise os dados antes de tentar novamente.'
                        : 'Sua solicitação foi enviada e está aguardando análise.'}</p>
                <a href="cadastro-ong.html" class="btn-instituicao">Ver Dados da Solicitação</a>
            `;
        } catch (error) {
            console.error('Erro ao carregar instituição:', error);
        }
    }

    carregarInstituicaoVinculada();

    // contador de caracteres da biografia 
    document.getElementById('edit-biografia').addEventListener('input', function () {
        document.getElementById('contador-bio').textContent = this.value.length;
    });

    // salvar as alterações do perfil
    document.getElementById('form-perfil').onsubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-salvar');
        btn.disabled = true;
        btn.textContent = 'Salvando...';

        const dadosAtualizados = {
            nome: document.getElementById('edit-nome').value,
            telefone: document.getElementById('edit-telefone').value,
            email: document.getElementById('edit-email').value,
            biografia: document.getElementById('edit-biografia').value,
        };

        const corBanner = inputHex.value.trim();
        if (!/^#[0-9A-Fa-f]{6}$/.test(corBanner)) {
            btn.disabled = false;
            btn.textContent = 'Salvar Alterações';
            mostrarAviso('Cor inválida', 'Use o formato #RRGGBB para salvar a cor do banner.');
            return;
        }

        dadosAtualizados.banner_cor = corBanner;

        const novaSenha = document.getElementById('edit-senha').value;
        if (novaSenha.trim() !== '') dadosAtualizados.senha = novaSenha;

        try {
            const response = await fetch(window.deerApi(`/usuarios/${sessao.id}`), {
                method: 'PUT',
                headers: window.deerAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(dadosAtualizados)
            });

            if (response.ok) {
                Object.assign(sessao, dadosAtualizados);
                sessionStorage.setItem('deer_sessao', JSON.stringify(sessao));
                preencherPerfil(sessao);
                document.getElementById('edit-senha').value = '';
                mostrarToast('pop-up-sucesso');
            } else {
                mostrarToast('pop-up-erro');
            }
        } catch { mostrarToast('pop-up-erro'); }
        finally {
            btn.disabled = false;
            btn.textContent = 'Salvar Alterações';
            forcarCpfDesabilitado();
        }
    };

    // upload de foto de perfil
    document.getElementById('avatar-wrapper').onclick = () => {
        document.getElementById('input-foto').click();
    };

    document.getElementById('input-foto').addEventListener('change', async (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
        if (!tiposPermitidos.includes(arquivo.type)) {
            mostrarAviso('Formato inválido', 'Use uma imagem JPG, PNG ou WebP.');
            return;
        }
        if (arquivo.size > 2 * 1024 * 1024) {
            mostrarAviso('Imagem muito pesada', 'A imagem deve ter no máximo 2MB.');
            return;
        }

        const loading = document.getElementById('avatar-loading');
        loading.classList.add('ativo');

        try {
            const respostaUpload = await fetch(
                window.deerApi(`/usuarios/${sessao.id}/foto`),
                {
                    method: 'POST',
                    headers: window.deerAuthHeaders({ 'Content-Type': arquivo.type }),
                    body: arquivo
                }
            );

            if (!respostaUpload.ok) {
                const erroTexto = await respostaUpload.text();
                console.error('Erro upload storage:', erroTexto);
                throw new Error('Falha no upload');
            }

            const resultado = await respostaUpload.json();
            const urlFoto = resultado.perfil_url;

            Object.assign(sessao, { perfil_url: urlFoto });
            sessionStorage.setItem('deer_sessao', JSON.stringify(sessao));
            preencherPerfil(sessao);
            mostrarToast('pop-up-sucesso');

        } catch (err) {
            console.error('Erro no upload:', err);
            mostrarToast('pop-up-foto-erro');
        } finally {
            loading.classList.remove('ativo');
            e.target.value = '';
        }
    });

    // cor do banner e tema do site
    btnEditarBanner.onclick = (e) => {
        e.stopPropagation();
        painel.classList.toggle('aberto');
    };

    document.addEventListener('click', (e) => {
        if (!painel.contains(e.target) && e.target !== btnEditarBanner) {
            painel.classList.remove('aberto');
        }
    });

    inputHex.addEventListener('input', () => {
        const val = inputHex.value.trim();
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            aplicarCorBanner(val);
        }
    });

    document.querySelectorAll('.cor-rapida').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const cor = btn.dataset.cor;
            aplicarCorBanner(cor);
        };
    });

    // seção de endereço
    function mostrarEnderecoAtual(usuario) {
        const texto = document.getElementById('texto-endereco');
        if (!texto) return;
        texto.textContent = usuario.rua
            ? `${usuario.rua}, ${usuario.numero || 'S/N'} — ${usuario.bairro}, ${usuario.cidade}/${usuario.estado}`
            : 'Nenhum endereço cadastrado.';
    }

    mostrarEnderecoAtual(sessao);

    // Recarrega do back-end para evitar usar dados velhos guardados no sessionStorage.
    async function atualizarUsuarioDaSessao() {
        try {
            const response = await fetch(window.deerApi(`/usuarios/${sessao.id}`), {
                headers: window.deerAuthHeaders()
            });
            const resultado = await response.json();
            if (!response.ok || !resultado.usuario) return;

            Object.assign(sessao, resultado.usuario);
            sessionStorage.setItem('deer_sessao', JSON.stringify(sessao));
            preencherPerfil(sessao);
            mostrarEnderecoAtual(sessao);
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
        }
    }

    atualizarUsuarioDaSessao();

    document.getElementById('btn-abrir-endereco').onclick = () => {
        document.getElementById('secao-endereco-perfil').style.display = 'block';
        document.getElementById('btn-abrir-endereco').style.display = 'none';

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
        set('edit-cep', sessao.cep);
        set('edit-rua', sessao.rua);
        set('edit-bairro', sessao.bairro);
        set('edit-cidade', sessao.cidade);
        set('edit-estado', sessao.estado);
        set('edit-numero', sessao.numero);
        set('edit-complemento', sessao.complemento);

        const cepInput = document.getElementById('edit-cep');
        if (cepInput && !cepInput.dataset.mascaraAplicada) {
            mascaraCEP(cepInput, 'edit-');
            cepInput.dataset.mascaraAplicada = 'true';
        }
    };

    document.getElementById('btn-alterar-endereco').onclick = () => {
        document.getElementById('secao-endereco-perfil').style.display = 'none';
        document.getElementById('btn-abrir-endereco').style.display = 'block';
    };

    document.getElementById('btn-salvar-endereco').onclick = async () => {
        const btn = document.getElementById('btn-salvar-endereco');
        btn.disabled = true;
        btn.textContent = 'Salvando...';

        const enderecoAtualizado = {
            cep: document.getElementById('edit-cep').value,
            rua: document.getElementById('edit-rua').value,
            bairro: document.getElementById('edit-bairro').value,
            cidade: document.getElementById('edit-cidade').value,
            estado: document.getElementById('edit-estado').value,
            numero: document.getElementById('edit-numero').value,
            complemento: document.getElementById('edit-complemento').value,
        };

        try {
            const response = await fetch(window.deerApi(`/usuarios/${sessao.id}`), {
                method: 'PUT',
                headers: window.deerAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(enderecoAtualizado)
            });

            if (response.ok) {
                Object.assign(sessao, enderecoAtualizado);
                sessionStorage.setItem('deer_sessao', JSON.stringify(sessao));
                document.getElementById('secao-endereco-perfil').style.display = 'none';
                document.getElementById('btn-abrir-endereco').style.display = 'block';
                mostrarEnderecoAtual(sessao);
                mostrarToast('pop-up-sucesso');
            } else { mostrarToast('pop-up-erro'); }
        } catch { mostrarToast('pop-up-erro'); }
        finally {
            btn.disabled = false;
            btn.textContent = 'Salvar Endereço';
        }
    };

    // Exclusão em duas etapas: primeiro confirma a senha, depois exige aceite do aviso permanente.
    const modalExclusao = document.getElementById('modal-exclusao');
    const etapaSenhaExclusao = document.getElementById('etapa-senha-exclusao');
    const etapaConfirmarExclusao = document.getElementById('etapa-confirmar-exclusao');
    const inputSenhaExclusao = document.getElementById('senha-exclusao');
    const erroSenhaExclusao = document.getElementById('erro-senha-exclusao');
    const aceiteExclusao = document.getElementById('aceite-exclusao');
    const btnValidarSenhaExclusao = document.getElementById('btn-validar-senha-exclusao');
    const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');

    let senhaConfirmadaExclusao = '';

    function mostrarEtapaExclusao(etapa) {
        etapaSenhaExclusao.classList.toggle('ativo', etapa === 'senha');
        etapaConfirmarExclusao.classList.toggle('ativo', etapa === 'confirmacao');
    }

    function limparModalExclusao() {
        senhaConfirmadaExclusao = '';
        inputSenhaExclusao.value = '';
        inputSenhaExclusao.classList.remove('erro');
        erroSenhaExclusao.classList.remove('visivel');
        erroSenhaExclusao.textContent = 'Informe sua senha para continuar.';
        aceiteExclusao.checked = false;
        btnConfirmarExclusao.disabled = true;
        btnConfirmarExclusao.textContent = 'Excluir definitivamente';
        btnValidarSenhaExclusao.disabled = false;
        btnValidarSenhaExclusao.textContent = 'Continuar';
        mostrarEtapaExclusao('senha');
    }

    function fecharModalExclusao() {
        modalExclusao.classList.remove('ativo');
        limparModalExclusao();
    }

    function mostrarErroSenhaExclusao(msg) {
        inputSenhaExclusao.classList.add('erro');
        erroSenhaExclusao.textContent = msg;
        erroSenhaExclusao.classList.add('visivel');
    }

    document.getElementById('btn-abrir-exclusao').onclick = () => {
        limparModalExclusao();
        modalExclusao.classList.add('ativo');
        setTimeout(() => inputSenhaExclusao.focus(), 100);
    };

    document.getElementById('btn-cancelar-exclusao').onclick = fecharModalExclusao;

    document.getElementById('btn-voltar-senha-exclusao').onclick = () => {
        senhaConfirmadaExclusao = '';
        aceiteExclusao.checked = false;
        btnConfirmarExclusao.disabled = true;
        mostrarEtapaExclusao('senha');
        setTimeout(() => inputSenhaExclusao.focus(), 100);
    };

    modalExclusao.onclick = (e) => {
        if (e.target === e.currentTarget) fecharModalExclusao();
    };

    inputSenhaExclusao.addEventListener('input', () => {
        inputSenhaExclusao.classList.remove('erro');
        erroSenhaExclusao.classList.remove('visivel');
    });

    inputSenhaExclusao.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnValidarSenhaExclusao.click();
        }
    });

    aceiteExclusao.addEventListener('change', () => {
        btnConfirmarExclusao.disabled = !aceiteExclusao.checked;
    });

    btnValidarSenhaExclusao.onclick = async () => {
        const senhaDigitada = inputSenhaExclusao.value;

        if (!senhaDigitada.trim()) {
            mostrarErroSenhaExclusao('Informe sua senha para continuar.');
            return;
        }

        btnValidarSenhaExclusao.disabled = true;
        btnValidarSenhaExclusao.textContent = 'Validando...';

        try {
            const payload = sessao.cpf
                ? { cpf: String(sessao.cpf).replace(/\D/g, ''), senha: senhaDigitada }
                : { email: sessao.email, senha: senhaDigitada };

            const response = await fetch(window.deerApi('/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                senhaConfirmadaExclusao = senhaDigitada;
                mostrarEtapaExclusao('confirmacao');
            } else {
                mostrarErroSenhaExclusao('Senha incorreta. Verifique e tente novamente.');
            }
        } catch {
            mostrarErroSenhaExclusao('Servidor indisponível. Tente novamente em instantes.');
        } finally {
            btnValidarSenhaExclusao.disabled = false;
            btnValidarSenhaExclusao.textContent = 'Continuar';
        }
    };

    btnConfirmarExclusao.onclick = async () => {
        if (!aceiteExclusao.checked || !senhaConfirmadaExclusao) return;

        btnConfirmarExclusao.disabled = true;
        btnConfirmarExclusao.textContent = 'Excluindo...';

        try {
            const response = await fetch(window.deerApi(`/usuarios/${sessao.id}`), {
                method: 'DELETE',
                headers: window.deerAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ senha: senhaConfirmadaExclusao })
            });

            if (response.ok) {
                window.limparSessaoDeer();
                window.location.href = '../pages/login.html?conta=excluida';
            } else {
                const resultado = await response.json().catch(() => ({}));
                mostrarToast('pop-up-erro');
                if (resultado.error && resultado.error.toLowerCase().includes('senha')) {
                    mostrarEtapaExclusao('senha');
                    mostrarErroSenhaExclusao('Senha incorreta. Verifique e tente novamente.');
                }
                btnConfirmarExclusao.disabled = false;
                btnConfirmarExclusao.textContent = 'Excluir definitivamente';
            }
        } catch {
            mostrarToast('pop-up-erro');
            btnConfirmarExclusao.disabled = false;
            btnConfirmarExclusao.textContent = 'Excluir definitivamente';
        }
    };

}); // fim do DOM
