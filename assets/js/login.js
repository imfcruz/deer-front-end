document.addEventListener('DOMContentLoaded', () => {

        const identificadorInput = document.getElementById('identificador');
        const senhaInput         = document.getElementById('senha');
        const tipoBadge          = document.getElementById('tipo-badge');
        const toastErro          = document.getElementById('toast-erro');
        const btnEntrar          = document.getElementById('btn-entrar');

        olhinho('senha');

        // O mesmo campo aceita e-mail ou CPF. Enquanto o usuario digita, ajustamos a mascara e a etiqueta.
        identificadorInput.addEventListener('input', () => {
            const v = identificadorInput.value.trim();
            identificadorInput.classList.remove('erro');
            toastErro.classList.remove('visivel');

            // Quando comeca com numero, tratamos como CPF e deixamos apenas os 11 digitos.
            if (/^\d/.test(v)) {
                identificadorInput.inputMode = 'numeric';
                tipoBadge.textContent = 'CPF';
                tipoBadge.classList.add('visivel');
                let nums = v.replace(/\D/g, '').slice(0, 11);
                if (nums.length > 9) nums = nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                else if (nums.length > 6) nums = nums.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
                else if (nums.length > 3) nums = nums.replace(/(\d{3})(\d{3})/, '$1.$2');
                identificadorInput.value = nums;
            } else if (v.includes('@') || (!v.startsWith('0') && v.length > 0 && !/^\d/.test(v))) {
                identificadorInput.inputMode = 'email';
                tipoBadge.textContent = 'E-mail';
                tipoBadge.classList.add('visivel');
            } else if (v === '') {
                tipoBadge.classList.remove('visivel');
                identificadorInput.inputMode = 'email';
            }
        });

        // Centraliza a mensagem de erro sem usar alert nativo do navegador.
        function mostrarErroGlobal(msg) {
            toastErro.textContent = msg;
            toastErro.classList.add('visivel');
            identificadorInput.classList.add('erro');
            senhaInput.classList.add('erro');
        }

        // Envia o login para o back-end somente depois das validacoes basicas do front.
        document.getElementById('auth-form-login').onsubmit = async (e) => {
            e.preventDefault();
            toastErro.classList.remove('visivel');
            identificadorInput.classList.remove('erro');
            senhaInput.classList.remove('erro');

            const identificador = identificadorInput.value.trim();
            const senha = senhaInput.value;

            if (!identificador) {
                mostrarErroGlobal('Informe seu e-mail ou CPF.');
                return;
            }
            if (!senha) {
                mostrarErroGlobal('Informe sua senha.');
                senhaInput.classList.add('erro');
                return;
            }

            btnEntrar.disabled = true;
            btnEntrar.innerHTML = '<span class="spinner-btn"></span>Entrando...';

            // Se for CPF, removemos a mascara antes de mandar para a rota /login.
            const ehCPF = /^\d/.test(identificador);
            const payload = ehCPF
                ? { cpf: identificador.replace(/\D/g, ''), senha }
                : { email: identificador, senha };

            try {
                const response = await fetch(window.deerApi('/login'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const resultado = await response.json();

                if (response.ok) {
                    // A resposta traz usuario e token. O usuario monta a interface; o token libera rotas protegidas.
                    window.salvarSessaoDeer(resultado.usuario, resultado.token);
                    window.location.href = '../index.html';
                } else {
                    mostrarErroGlobal(resultado.error || 'E-mail/CPF ou senha incorretos.');
                }
            } catch {
                mostrarErroGlobal('Servidor indisponível. Verifique sua conexão.');
            } finally {
                btnEntrar.disabled = false;
                btnEntrar.textContent = 'Entrar';
            }
        };

    });

