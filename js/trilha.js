// Script para página de trilhas de aprofundamento
$(document).ready(function() {
    // Carregar header da página de trilha
    initContentPage().then(function() {
        // Carregar trilha baseado no parâmetro da URL após header estar pronto
        carregarTrilhaPorParametro();
    });
});

// Função para carregar trilha baseado no parâmetro da URL
function carregarTrilhaPorParametro() {
    const urlParams = new URLSearchParams(window.location.search);
    const palavra = urlParams.get('palavra');
    const origem = urlParams.get('origem') || 'conteudo';
    DebugManager.log("Parâmetros da URL:", urlParams.toString());
    
    if (palavra) {
        const nomeArquivo = normalizarPalavra(palavra);
        DebugManager.log("Carregando trilha para:", palavra, "->", nomeArquivo);
        
        // Atualizar breadcrumb
        atualizarBreadcrumb(palavra, origem);
        
        carregarDadosTrilha(nomeArquivo, palavra);
    } else {
        mostrarErroTrilha("Nenhuma palavra especificada para a trilha.");
    }
}

// Função para atualizar breadcrumb
function atualizarBreadcrumb(palavra, origem) {
    // Capitalizar primeira letra
    const palavraFormatada = palavra.charAt(0).toUpperCase() + palavra.slice(1);
    const urlOrigem = origem === 'conteudo' ? 'conteudo.html' : 'index.html';
    
    // Criar breadcrumb personalizado com link para o conceito
    const breadcrumbData = [
        { 
            name: palavraFormatada, 
            link: `${urlOrigem}?palavra=${encodeURIComponent(palavra)}`,
            id: 'breadcrumb-conceito' 
        },
        { name: 'Trilha de Aprofundamento', isLast: true }
    ];
    
    BreadcrumbManager.create(breadcrumbData);
}

// Função para carregar dados da trilha
function carregarDadosTrilha(nomeArquivo, palavraOriginal) {
    $("#loading").show();
    $("#trilha-section").hide();
    $("#erro-trilha").hide();
    
    $.getJSON(`../dados/${nomeArquivo}.json`)
        .done(function(data) {
            DebugManager.log("Dados da trilha carregados:", data);
            
            $("#loading").fadeOut(300, function() {
                processarDadosTrilha(data, palavraOriginal);
                $("#trilha-section").fadeIn(300);
            });
        })
        .fail(function(error) {
            DebugManager.error("Erro ao carregar dados da trilha:", error);
            mostrarErroTrilha("Erro ao carregar dados da trilha.");
        });
}

// Função para processar dados da trilha
function processarDadosTrilha(data, palavraOriginal) {
    // Armazenar dados globalmente
    window.dadosTrilha = data;
    window.palavraAtual = palavraOriginal;
  
    // Processar atividades da trilha
    if (data.atividades_trilha && data.atividades_trilha.length > 0) {
        criarAtividadesTrilha(data.atividades_trilha);
        configurarProgressoTrilha(data.atividades_trilha.length);
    } else {
        mostrarErroTrilha("Nenhuma atividade de trilha encontrada para este conceito.");
    }
}

// Função para criar atividades da trilha
function criarAtividadesTrilha(atividades) {
    const trilhaGrid = $('#trilha-grid');
    trilhaGrid.empty();
    
    atividades.forEach((atividade, index) => {
        const atividadeId = `trilha-atividade-${index}`;
        const status = obterStatusAtividade(index);
        
        // Processar objetivos didáticos
        const objetivos = Array.isArray(atividade.objetivos_didaticos) 
            ? atividade.objetivos_didaticos.join(' • ')
            : atividade.objetivos_didaticos || '';
        
        const atividadeHTML = `
            <div class="trilha-card ${status}" id="${atividadeId}" data-index="${index}" data-aos="fade-up" data-aos-delay="${index * 100}">
                <!-- Indicador de status -->
                <div class="trilha-status-indicator">
                    <div class="status-icon">${obterIconeStatus(status)}</div>
                    <span class="status-text">${obterTextoStatus(status)}</span>
                </div>
                
                <!-- Cabeçalho da atividade -->
                <div class="trilha-card-header">
                    <div class="atividade-numero">Atividade ${index + 1}</div>
                    <h3 class="trilha-titulo">${atividade.titulo}</h3>
                </div>
                
                <!-- Objetivos -->
                <div class="trilha-objetivos">
                    <h4>🎯 Objetivos de Aprendizagem</h4>
                    <p>${objetivos}</p>
                </div>
                
                <!-- Descrição -->
                <div class="trilha-descricao">
                    ${atividade.descricao}
                </div>
                
                <!-- Informações adicionais -->
                ${atividade.tempo_estimado ? `
                    <div class="trilha-info">
                        <span class="info-item">
                            <span class="info-icon">⏱️</span>
                            Tempo estimado: ${atividade.tempo_estimado}
                        </span>
                    </div>
                ` : ''}
                
                <!-- Ações da atividade -->
                <div class="trilha-actions">
                    ${status === 'disponivel' ? `
                        <button class="btn btn-primary btn-trilha-concluir" onclick="concluirAtividadeTrilha(${index})" ${status !== 'disponivel' ? 'disabled' : ''}>
                            ${status === 'concluida' ? '✅ Concluída' : '🚀 Iniciar Atividade'}
                        </button>
                    ` : status === 'concluida' ? `
                        <button class="btn btn-success btn-trilha-concluir" disabled>
                            ✅ Atividade Concluída
                        </button>
                    ` : `
                        <button class="btn btn-secondary btn-trilha-concluir" disabled>
                            🔒 Complete a atividade anterior
                        </button>
                    `}
                    
                    ${atividade.trilha_relacionada ? `
                        <button class="btn btn-outline" onclick="verTrilhaRelacionada('${atividade.trilha_relacionada}')" ${status !== 'concluida' ? 'style="display: none;"' : ''}>
                            Ir para "${atividade.trilha_relacionada}" →
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        trilhaGrid.append(atividadeHTML);
    });
    
    // Atualizar AOS para novos elementos
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
    
    // Mostrar ações da trilha
    $('#trilha-actions').fadeIn(300);
}

// Função para obter status da atividade (simulando progresso)
function obterStatusAtividade(index) {
    const progressoSalvo = localStorage.getItem(`trilha_progresso_${window.palavraAtual}`);
    if (progressoSalvo) {
        const progresso = JSON.parse(progressoSalvo);
        if (progresso.concluidas.includes(index)) {
            return 'concluida';
        }
        if (index === 0 || progresso.concluidas.includes(index - 1)) {
            return 'disponivel';
        }
    } else if (index === 0) {
        return 'disponivel';
    }
    return 'bloqueada';
}

// Função para obter ícone do status
function obterIconeStatus(status) {
    switch (status) {
        case 'concluida': return '✅';
        case 'disponivel': return '🎯';
        case 'bloqueada': return '🔒';
        default: return '⭕';
    }
}

// Função para obter texto do status
function obterTextoStatus(status) {
    switch (status) {
        case 'concluida': return 'Concluída';
        case 'disponivel': return 'Disponível';
        case 'bloqueada': return 'Bloqueada';
        default: return 'Indefinido';
    }
}

// Função para configurar progresso da trilha
function configurarProgressoTrilha(totalAtividades) {
    const progressoSalvo = localStorage.getItem(`trilha_progresso_${window.palavraAtual}`);
    let atividadesConcluidas = 0;
    
    if (progressoSalvo) {
        const progresso = JSON.parse(progressoSalvo);
        atividadesConcluidas = progresso.concluidas.length;
    }
    
    const porcentagem = Math.round((atividadesConcluidas / totalAtividades) * 100);
    
    // Atualizar elementos de progresso
    $('#progress-current').text(atividadesConcluidas);
    $('#progress-total').text(totalAtividades);
    $('#progress-percentage').text(`${porcentagem}%`);
    $('#progress-fill').css('width', `${porcentagem}%`);
    
    // Mostrar barra de progresso
    $('#trilha-progress').fadeIn(300);
    
    // Verificar se todas as atividades foram concluídas
    if (atividadesConcluidas === totalAtividades) {
        mostrarTrilhaConcluida();
    }
}

// Função para concluir atividade da trilha
function concluirAtividadeTrilha(index) {
    const atividade = window.dadosTrilha.atividades_trilha[index];
    const atividadeCard = $(`#trilha-atividade-${index}`);
    const button = atividadeCard.find('.btn-trilha-concluir');
    
    // Feedback visual
    button.text("✅ Concluindo...")
          .prop("disabled", true)
          .addClass("btn-loading");
    
    // Simular processamento
    setTimeout(() => {
        // Salvar progresso
        salvarProgressoAtividade(index);
        
        // Atualizar visual da atividade
        atualizarStatusAtividade(index, 'concluida');
        
        // Atualizar progresso geral
        const totalAtividades = window.dadosTrilha.atividades_trilha.length;
        configurarProgressoTrilha(totalAtividades);
        
        // Liberar próxima atividade se existir
        if (index + 1 < totalAtividades) {
            atualizarStatusAtividade(index + 1, 'disponivel');
        }
        
        // Mostrar modal de conclusão
        mostrarModalConclusao(atividade, index);
        
    }, 1000);
}

// Função para salvar progresso da atividade
function salvarProgressoAtividade(index) {
    const chaveProgresso = `trilha_progresso_${window.palavraAtual}`;
    let progresso = {
        concluidas: [],
        ultimaAtualizacao: new Date().toISOString()
    };
    
    const progressoSalvo = localStorage.getItem(chaveProgresso);
    if (progressoSalvo) {
        progresso = JSON.parse(progressoSalvo);
    }
    
    if (!progresso.concluidas.includes(index)) {
        progresso.concluidas.push(index);
        progresso.ultimaAtualizacao = new Date().toISOString();
        localStorage.setItem(chaveProgresso, JSON.stringify(progresso));
    }
}

// Função para atualizar status visual da atividade
function atualizarStatusAtividade(index, novoStatus) {
    const atividadeCard = $(`#trilha-atividade-${index}`);
    const button = atividadeCard.find('.btn-trilha-concluir');
    const statusIndicator = atividadeCard.find('.trilha-status-indicator');
    
    // Remover classes de status antigas
    atividadeCard.removeClass('disponivel bloqueada concluida');
    atividadeCard.addClass(novoStatus);
    
    // Atualizar indicador de status
    statusIndicator.find('.status-icon').text(obterIconeStatus(novoStatus));
    statusIndicator.find('.status-text').text(obterTextoStatus(novoStatus));
    
    // Atualizar botão
    if (novoStatus === 'concluida') {
        button.removeClass('btn-primary btn-loading')
              .addClass('btn-success')
              .text('✅ Atividade Concluída')
              .prop('disabled', true);
        
        // Mostrar botão de trilha relacionada se existir
        const btnTrilhaRelacionada = atividadeCard.find('.btn-outline');
        if (btnTrilhaRelacionada.length) {
            btnTrilhaRelacionada.show();
        }
    } else if (novoStatus === 'disponivel') {
        button.removeClass('btn-secondary btn-loading')
              .addClass('btn-primary')
              .text('🚀 Iniciar Atividade')
              .prop('disabled', false);
    }
}

// Função para mostrar modal de conclusão
function mostrarModalConclusao(atividade, index) {
    const totalAtividades = window.dadosTrilha.atividades_trilha.length;
    const progressoSalvo = localStorage.getItem(`trilha_progresso_${window.palavraAtual}`);
    let atividadesConcluidas = 0;
    
    if (progressoSalvo) {
        const progresso = JSON.parse(progressoSalvo);
        atividadesConcluidas = progresso.concluidas.length;
    }
    
    // Atualizar conteúdo do modal
    $('#modal-mensagem').html(`
        Parabéns! Você concluiu a atividade:<br>
        <strong>"${atividade.titulo}"</strong>
    `);
    
    $('#modal-progress-text').text(`${atividadesConcluidas} de ${totalAtividades} atividades`);
    
    // Verificar se há trilha relacionada e se todas as atividades foram concluídas
    const btnProximaTrilha = $('#btn-modal-proxima');
    if (atividadesConcluidas === totalAtividades && atividade.trilha_relacionada) {
        btnProximaTrilha.show().attr('onclick', `irParaTrilhaRelacionada('${atividade.trilha_relacionada}')`);
    } else {
        btnProximaTrilha.hide();
    }
    
    // Mostrar modal
    $('#modal-conclusao').fadeIn(300);
}

// Função para fechar modal de conclusão
function fecharModalConclusao() {
    $('#modal-conclusao').fadeOut(300);
}

// Função para ir para trilha relacionada
function irParaTrilhaRelacionada(trilhaRelacionada) {
    const trilhaNormalizada = normalizarPalavra(trilhaRelacionada);
    window.location.href = `trilha.html?palavra=${encodeURIComponent(trilhaRelacionada)}&origem=trilha`;
}

// Função para ver trilha relacionada (botão individual)
function verTrilhaRelacionada(trilhaRelacionada) {
    irParaTrilhaRelacionada(trilhaRelacionada);
}

// Função para mostrar trilha concluída
function mostrarTrilhaConcluida() {
    const btnContinuar = $('#btn-continuar-trilha');
    const ultimaAtividade = window.dadosTrilha.atividades_trilha[window.dadosTrilha.atividades_trilha.length - 1];
    
    if (ultimaAtividade && ultimaAtividade.trilha_relacionada) {
        btnContinuar.attr('onclick', `irParaTrilhaRelacionada('${ultimaAtividade.trilha_relacionada}')`);
        btnContinuar.text(`Continuar para "${ultimaAtividade.trilha_relacionada}" →`);
        btnContinuar.show();
    }
}

// Função para voltar para o conceito
function voltarParaConceito() {
    const urlParams = new URLSearchParams(window.location.search);
    const palavra = urlParams.get('palavra');
    const origem = urlParams.get('origem') || 'conteudo';
    
    if (palavra) {
        const urlDestino = origem === 'conteudo' ? 'conteudo.html' : 'index.html';
        window.location.href = `${urlDestino}?palavra=${encodeURIComponent(palavra)}`;
    } else {
        window.location.href = 'index.html';
    }
}

// Função para continuar trilha (botão principal)
function continuarTrilha() {
    const ultimaAtividade = window.dadosTrilha.atividades_trilha[window.dadosTrilha.atividades_trilha.length - 1];
    if (ultimaAtividade && ultimaAtividade.trilha_relacionada) {
        irParaTrilhaRelacionada(ultimaAtividade.trilha_relacionada);
    }
}

// Função para mostrar erro
function mostrarErroTrilha(mensagem) {
    $("#loading").fadeOut(300, function() {
        if (mensagem) {
            $("#erro-trilha p:first").text(mensagem);
        }
        $("#erro-trilha").fadeIn(300);
    });
}

// Função para normalizar palavra (reutilizada)
function normalizarPalavra(palavra) {
    return palavra
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
}
