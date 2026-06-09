document.addEventListener('DOMContentLoaded', () => {
    // Antes de mostrar dados sensiveis, conferimos se a sessao local indica perfil administrador.
    validarAcessoAdmin();
    // Se passou pela verificacao, buscamos no back-end os pedidos que ainda precisam de analise.
    carregarONGsPendentes();
});

// Protege textos vindos do banco antes de colocar dentro de HTML montado pelo JavaScript.
function textoSeguro(valor = '') {
    return String(valor || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function validarAcessoAdmin() {
    const logado = JSON.parse(sessionStorage.getItem('deer_sessao'));
    
    // Essa verificacao melhora a experiencia no front, mas o back-end tambem valida o token de admin.
    if (!logado || logado.tipo !== 'administrador') {
        if (window.mostrarAvisoGlobal) {
            window.mostrarAvisoGlobal("Acesso Negado", "Essa área é restrita.");
        }
        window.location.href = "../index.html";
    }
}

// Monta a tabela de solicitacoes pendentes. A rota exige token, por isso usamos deerAuthHeaders.
async function carregarONGsPendentes() {
    try {
        const response = await fetch(window.deerApi('/admin/instituicoes-pendentes'), {
            method: 'GET',
            headers: window.deerAuthHeaders()
        });
        
        const dados = await response.json();
        const lista = Array.isArray(dados) ? dados : [];
        
        // Guardamos a lista em memoria para abrir modais sem precisar consultar o back novamente.
        window.listaDeONGs = lista;

        const tbody = document.querySelector('.admin-table tbody');
        tbody.innerHTML = '';

        if (!response.ok || lista.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhuma solicitação pendente ou acesso negado.</td></tr>';
            return;
        }

        // Cada linha mostra uma solicitacao e deixa os botoes de aprovar/recusar prontos para uso.
        lista.forEach(instituicao => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="align-middle">
                    <a href="" onclick="abrirModalDetalhes(${instituicao.id}); return false;" style="color: var(--red-base); font-weight: 600; text-decoration: none;">
                        ${textoSeguro(instituicao.nome_publico || instituicao.razao_social)}
                    </a>
                </td>
                <td class="align-middle">${textoSeguro(instituicao.cnpj)}</td>
                <td class="align-middle">${textoSeguro(instituicao.status)}</td>
                <td class="align-middle">
                    <button type="button" class="btn btn-sm btn-success" title="Aceitar Instituição" onclick="prepararConfirmacao(${instituicao.id}, 'aprovar')">
                        <img src="../assets/img/check.png" style="width: 24px;">
                    </button>
                </td>
                <td class="align-middle">
                    <button type="button" class="btn btn-sm btn-danger" title="Recusar Instituição" onclick="prepararConfirmacao(${instituicao.id}, 'recusar')">
                        <img src="../assets/img/delete.png" style="width: 24px;">
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar a lista:', error);
    }
}

// Abre os detalhes da instituicao selecionada usando os dados que ja estao em window.listaDeONGs.
window.abrirModalDetalhes = function(id) {
    const ong = window.listaDeONGs.find(item => item.id === id);
    if (!ong) return;

    document.getElementById('modal-ong-nome').textContent = ong.nome_publico || ong.razao_social;
    document.getElementById('modal-ong-cnpj').textContent = ong.cnpj;
    document.getElementById('modal-ong-local').textContent = `${ong.cidade || 'N/A'} / ${ong.estado || 'N/A'}`;
    document.getElementById('modal-ong-pix').textContent = ong.chave_pix || 'Não informada';
    document.getElementById('modal-ong-tipo-pix').textContent = ong.tipo_chave_pix || '-';
    document.getElementById('modal-ong-desc').textContent = ong.descricao || 'Nenhuma descrição fornecida pela instituição.';

    document.getElementById('modal-detalhes-ong').classList.add('ativo');
};

// Fecha apenas o modal de detalhes, sem alterar a solicitacao no banco.
window.fecharModalDetalhes = function() {
    document.getElementById('modal-detalhes-ong').classList.remove('ativo');
};

// Guarda qual acao o administrador escolheu antes de confirmar no modal.
let acaoPendente = null;

// Prepara a confirmacao visual. A mudanca real so acontece quando executarAcaoPendente roda.
window.prepararConfirmacao = function(id, tipoAcao) {
    const ong = window.listaDeONGs.find(item => item.id === id);
    if (!ong) return;

    acaoPendente = { id: id, tipo: tipoAcao };

    const titulo = document.getElementById('titulo-confirmacao');
    const texto = document.getElementById('texto-confirmacao');
    const icone = document.getElementById('icone-confirmacao');
    const btnConfirmar = document.getElementById('btn-confirmar-acao');
    const nomeOng = ong.nome_publico || ong.razao_social;

    if (tipoAcao === 'aprovar') {
        titulo.textContent = 'Aprovar Instituição';
        titulo.style.color = '#2E7D32'; 
        texto.innerHTML = `Tem certeza que deseja <strong>APROVAR</strong> a instituição <strong>${textoSeguro(nomeOng)}</strong>?<br>Ela passará a aparecer imediatamente na página de doações.`;
        icone.style.background = 'rgba(67, 160, 71, 0.13)';
        icone.style.color = '#2E7D32';
        icone.textContent = '✓';
        btnConfirmar.style.backgroundColor = '#43A047'; 
        btnConfirmar.textContent = 'Sim, Aprovar';
    } else {
        titulo.textContent = 'Recusar Instituição';
        titulo.style.color = 'var(--red-base)'; 
        texto.innerHTML = `Tem certeza que deseja <strong>RECUSAR</strong> a instituição <strong>${textoSeguro(nomeOng)}</strong>?<br>Essa solicitação será alterada para rejeitada.`;
        icone.style.background = 'rgba(229, 57, 53, 0.12)';
        icone.style.color = 'var(--red-base)';
        icone.textContent = '!';
        btnConfirmar.style.backgroundColor = 'var(--red-base)';
        btnConfirmar.textContent = 'Sim, Recusar';
    }

    document.getElementById('modal-confirmacao-acao').classList.add('ativo');
};

// Cancela a acao escolhida e fecha o modal de confirmacao.
window.fecharModalConfirmacao = function() {
    document.getElementById('modal-confirmacao-acao').classList.remove('ativo');
    acaoPendente = null;
};

// Envia a aprovacao ou recusa para o back-end. Depois disso a tabela e recarregada.
window.executarAcaoPendente = async function() {
    if (!acaoPendente) return;

    const btn = document.getElementById('btn-confirmar-acao');
    const textoOriginal = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Processando...';

    try {
        const response = await fetch(window.deerApi(`/admin/instituicoes/${acaoPendente.id}/${acaoPendente.tipo}`), {
            method: 'PUT',
            headers: window.deerAuthHeaders({ 'Content-Type': 'application/json' })
        });

        if (!response.ok) throw new Error('Erro ao processar solicitação.');
        
        fecharModalConfirmacao();
        carregarONGsPendentes();
    } catch (error) {
        console.error('Erro ao processar:', error);
        btn.textContent = 'Erro ao processar';
        setTimeout(() => {
            btn.textContent = textoOriginal;
        }, 1800);
    } finally {
        btn.disabled = false;
        if (btn.textContent !== 'Erro ao processar') btn.textContent = textoOriginal;
    }
};
