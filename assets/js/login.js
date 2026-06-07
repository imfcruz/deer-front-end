document.addEventListener('DOMContentLoaded', () => {

        const identificadorInput = document.getElementById('identificador');
        const senhaInput         = document.getElementById('senha');
        const tipoBadge          = document.getElementById('tipo-badge');
        const toastErro          = document.getElementById('toast-erro');
        const btnEntrar          = document.getElementById('btn-entrar');

        olhinho('senha');

        // ── detecta tipo enquanto digita ──
        identificadorInput.addEventListener('input', () => {
            const v = identificadorInput.value.trim();
            identificadorInput.classList.remove('erro');
            toastErro.classList.remove('visivel');

            // se começa com dígito, trata como CPF e aplica máscara
            if (/^\d/.test(v)) {
                identificadorInput.inputMode = 'numeric';
                tipoBadge.textContent = 'CPF';
                tipoBadge.classList.add('visivel');
                // aplica máscara de CPF diretamente
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

        function mostrarErroGlobal(msg) {
            toastErro.textContent = msg;
            toastErro.classList.add('visivel');
            identificadorInput.classList.add('erro');
            senhaInput.classList.add('erro');
        }

        // ── submit ──
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

            // detecta se é CPF ou email
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

