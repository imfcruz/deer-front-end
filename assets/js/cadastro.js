document.addEventListener('DOMContentLoaded', () => {

        // Controla em qual etapa do formulario o usuario esta e guarda estados que influenciam a navegacao.
        let etapaAtual = 1;
        const totalEtapas = 3;
        let enderecoPreenchido = false;
        let camposEditaveis = false;

        const subtitulos = [
            'Comece com seus dados básicos de acesso.',
            'Agora seus dados de identificação.',
            'Por último, seu endereço para encontrar instituições perto de você.'
        ];

        // Elementos usados por varias funcoes do cadastro.
        const slider   = document.getElementById('form-slider');
        const toastErr = document.getElementById('toast-erro');

        // Move o formulario para a etapa escolhida. O translateX desloca o bloco inteiro como um carrossel.
        function irParaEtapa(n) {
            etapaAtual = n;
            slider.style.transform = `translateX(-${(n - 1) * 33.333}%)`;
            document.getElementById('subtitulo-etapa').textContent = subtitulos[n - 1];
            atualizarProgress();
            toastErr.classList.remove('visivel');
        }

        // Atualiza os indicadores superiores: etapas anteriores ficam concluidas e a atual fica ativa.
        function atualizarProgress() {
            for (let i = 1; i <= totalEtapas; i++) {
                const el = document.getElementById(`step-${i}`);
                el.classList.remove('ativo', 'concluido');
                if (i < etapaAtual) el.classList.add('concluido');
                else if (i === etapaAtual) el.classList.add('ativo');
            }
        }

        // Mostra erro perto do campo correspondente e aplica uma classe visual no input.
        function mostrarErro(id, msg) {
            const el = document.getElementById(id);
            const input = el.previousElementSibling.tagName === 'INPUT'
                ? el.previousElementSibling
                : el.parentElement.querySelector('input');
            if (input) input.classList.add('erro');
            el.textContent = msg || el.textContent;
            el.classList.add('visivel');
        }

        // Remove a marcacao de erro quando o usuario volta a digitar.
        function limparErro(inputEl, erroId) {
            inputEl.classList.remove('erro');
            document.getElementById(erroId)?.classList.remove('visivel');
        }

        // Pequeno aviso visual usado para feedbacks de sucesso.
        function mostrarToast(id) {
            const t = document.getElementById(id);
            if (!t) return;
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 3000);
        }

        // Mensagem usada quando o erro nao pertence a um unico campo.
        function mostrarErroGlobal(msg) {
            toastErr.textContent = msg;
            toastErr.classList.add('visivel');
        }

        // Reaproveita funcoes globais do script.js para CPF, telefone e exibicao da senha.
        mascaraCPF(document.getElementById('cpf'));
        mascaraTelefone(document.getElementById('telefone'));
        olhinho('senha');

        // Limpa os erros conforme o usuario corrige os campos.
        ['nome','email','senha','cpf','telefone'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => limparErro(el, `erro-${id}`));
        });

        // Primeira etapa: dados de acesso e nome completo.
        function validarEtapa1() {
            let ok = true;
            const nome  = document.getElementById('nome');
            const email = document.getElementById('email');
            const senha = document.getElementById('senha');

            if (!nome.value.trim() || nome.value.trim().split(' ').length < 2) {
                mostrarErro('erro-nome', 'Informe seu nome completo (nome e sobrenome).');
                ok = false;
            }
            if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                mostrarErro('erro-email', 'Informe um e-mail válido.');
                ok = false;
            }
            if (senha.value.length < 6) {
                mostrarErro('erro-senha', 'A senha deve ter no mínimo 6 caracteres.');
                ok = false;
            }
            return ok;
        }

        // Segunda etapa: documentos e telefone. A validacao aqui e simples e fica mais forte no back-end.
        function validarEtapa2() {
            let ok = true;
            const cpf = document.getElementById('cpf');
            const tel = document.getElementById('telefone');

            const cpfLimpo = cpf.value.replace(/\D/g, '');
            if (cpfLimpo.length !== 11) {
                mostrarErro('erro-cpf', 'CPF inválido. Verifique e tente novamente.');
                ok = false;
            }
            const telLimpo = tel.value.replace(/\D/g, '');
            if (telLimpo.length < 10) {
                mostrarErro('erro-telefone', 'Informe um telefone válido.');
                ok = false;
            }
            return ok;
        }

        // Terceira etapa: endereco. O CEP precisa ter sido consultado e o numero e obrigatorio.
        function validarEtapa3() {
            if (!enderecoPreenchido) {
                mostrarErroGlobal('Informe seu CEP para continuar.');
                return false;
            }
            const numero = document.getElementById('numero');
            if (!numero.value.trim()) {
                mostrarErro('erro-numero', 'O número do endereço é obrigatório.');
                return false;
            }
            return true;
        }

        // Botoes de avancar e voltar so mudam a etapa quando a etapa atual esta valida.
        document.getElementById('btn-next-1').onclick = () => {
            if (validarEtapa1()) irParaEtapa(2);
        };

        document.getElementById('btn-next-2').onclick = () => {
            if (validarEtapa2()) irParaEtapa(3);
        };

        document.getElementById('btn-back-2').onclick = () => irParaEtapa(1);
        document.getElementById('btn-back-3').onclick = () => irParaEtapa(2);

        // Consulta o CEP pela BrasilAPI. Quando encontra, preenche rua, bairro, cidade e estado automaticamente.
        const cepInput = document.getElementById('cep');
        const camposEnd = document.getElementById('campos-endereco');

        mascaraCEP(cepInput);

        cepInput.addEventListener('input', async () => {
            const v = cepInput.value.replace(/\D/g, '');
            if (v.length === 8) {
                try {
                    const resp = await fetch(`https://brasilapi.com.br/api/cep/v1/${v}`);
                    if (!resp.ok) throw new Error();
                    const d = await resp.json();

                    document.getElementById('rua').value    = d.street || '';
                    document.getElementById('bairro').value = d.neighborhood || '';
                    document.getElementById('cidade').value = d.city || '';
                    document.getElementById('estado').value = d.state || '';

                    // Por padrao, os campos vindos da API ficam bloqueados para evitar alteracao sem necessidade.
                    ['rua','bairro','cidade','estado'].forEach(id => {
                        document.getElementById(id).disabled = !camposEditaveis;
                    });

                    camposEnd.classList.add('visivel');
                    enderecoPreenchido = true;
                    document.getElementById('erro-cep').classList.remove('visivel');
                } catch {
                    document.getElementById('erro-cep').classList.add('visivel');
                    camposEnd.classList.remove('visivel');
                    enderecoPreenchido = false;
                }
            } else {
                camposEnd.classList.remove('visivel');
                enderecoPreenchido = false;
            }
        });

        // Se a API retornar algo errado, o usuario pode liberar os campos para correcao manual.
        document.getElementById('btn-corrigir').onclick = () => {
            camposEditaveis = true;
            ['rua','bairro','cidade','estado'].forEach(id => {
                document.getElementById(id).disabled = false;
            });
            document.getElementById('btn-corrigir').style.display = 'none';
        };

        // Envia o cadastro completo para o back-end. Se der certo, salva a sessao e manda para a home.
        document.getElementById('btn-submit').onclick = async () => {
            if (!validarEtapa3()) return;

            const btn = document.getElementById('btn-submit');
            btn.disabled = true;
            btn.innerHTML = '<span class="btn-loading"><span class="spinner-btn"></span>Criando conta...</span>';

            const dados = {
                nome:        document.getElementById('nome').value.trim(),
                email:       document.getElementById('email').value.trim(),
                senha:       document.getElementById('senha').value,
                cpf:         document.getElementById('cpf').value.replace(/\D/g, ''),
                telefone:    document.getElementById('telefone').value,
                cep:         document.getElementById('cep').value,
                rua:         document.getElementById('rua').value,
                bairro:      document.getElementById('bairro').value,
                cidade:      document.getElementById('cidade').value,
                estado:      document.getElementById('estado').value,
                numero:      document.getElementById('numero').value.trim(),
                complemento: document.getElementById('complemento').value.trim() || null,
            };

            try {
                const response = await fetch(window.deerApi('/usuarios'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                const resultado = await response.json();

                if (response.ok) {
                    mostrarToast('pop-up-sucesso');
                    setTimeout(() => {
                        // O cadastro ja retorna o usuario criado e o token, entao o usuario entra automaticamente.
                        window.salvarSessaoDeer(resultado.data[0], resultado.token);
                        window.location.href = '../index.html';
                    }, 2000);
                } else {
                    const msg = resultado.error || '';
                    // Esses testes ajudam a voltar para a etapa correta quando o back informa duplicidade.
                    if (msg.includes('email') || msg.includes('duplicate') || msg.includes('unique')) {
                        irParaEtapa(1);
                        mostrarErro('erro-email', 'Este e-mail já está cadastrado.');
                    } else if (msg.includes('cpf')) {
                        irParaEtapa(2);
                        mostrarErro('erro-cpf', 'Este CPF já está cadastrado.');
                    } else {
                        mostrarErroGlobal('Erro ao criar conta. Tente novamente.');
                    }
                }
            } catch {
                mostrarErroGlobal('Servidor indisponível. Verifique sua conexão.');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Criar minha conta';
            }
        };

    });

