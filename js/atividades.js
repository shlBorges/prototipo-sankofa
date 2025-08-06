// Script para página de atividades para sala de aula
$(document).ready(function() {
    // Carregar header da página de atividades
    initContentPage().then(function() {
        // Carregar atividades baseado no parâmetro da URL após header estar pronto
        carregarAtividadesPorParametro();
    });
});

// Variáveis globais
let atividadesOriginais = [];
let atividadesFiltradas = [];
let atividadeAtualModal = null;

// Função para carregar atividades baseado no parâmetro da URL
function carregarAtividadesPorParametro() {
    const urlParams = new URLSearchParams(window.location.search);
    const palavra = urlParams.get('palavra');
    const origem = urlParams.get('origem') || 'conteudo';
    const tipo = urlParams.get('tipo') || 'discente';
    
    if (palavra) {
        const nomeArquivo = normalizarPalavra(palavra);
        DebugManager.log("Carregando atividades para:", palavra, "->", nomeArquivo, "tipo:", tipo);
        
        // Atualizar breadcrumb
        atualizarBreadcrumb(palavra, origem);
        
        carregarDadosAtividades(nomeArquivo, palavra, tipo);
    } else {
        mostrarErroAtividades("Nenhuma palavra especificada para as atividades.");
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
        { name: 'Atividades para Sala de Aula', isLast: true }
    ];
    
    BreadcrumbManager.create(breadcrumbData);
}

// Função para carregar dados das atividades
function carregarDadosAtividades(nomeArquivo, palavraOriginal, tipo) {
    $("#loading").show();
    $("#atividades-section").hide();
    $("#erro-atividades").hide();
    
    $.getJSON(`../dados/${nomeArquivo}.json`)
        .done(function(data) {
            DebugManager.log("Dados das atividades carregados:", data);
            
            $("#loading").fadeOut(300, function() {
                processarDadosAtividades(data, palavraOriginal, tipo);
                $("#atividades-section").fadeIn(300);
            });
        })
        .fail(function(error) {
            DebugManager.error("Erro ao carregar dados das atividades:", error);
            mostrarErroAtividades("Erro ao carregar dados das atividades.");
        });
}

// Função para processar dados das atividades
function processarDadosAtividades(data, palavraOriginal, tipo) {
    // Armazenar dados globalmente
    window.dadosAtividades = data;
    window.palavraAtual = palavraOriginal;
    window.tipoAtual = tipo;

    // Selecionar atividades baseado no tipo
    const atividades = tipo === 'trilha' ? data.atividades_trilha : data.atividades_discente;
    
    if (atividades && atividades.length > 0) {
        atividadesOriginais = atividades;
        atividadesFiltradas = [...atividades];
        
        configurarFiltros(atividades);
        criarAtividadesSala(atividades);
        atualizarContador(atividades.length);
    } else {
        mostrarErroAtividades("Nenhuma atividade encontrada para este conceito e tipo.");
    }
}

// Função para configurar filtros
function configurarFiltros(atividades) {
    const tiposUnicos = [...new Set(atividades.map(ativ => ativ.tipo).filter(Boolean))];
    const selectTipo = $('#filter-tipo');
    
    // Limpar e popular filtro de tipos
    selectTipo.find('option:not(:first)').remove();
    tiposUnicos.forEach(tipo => {
        selectTipo.append(`<option value="${tipo}">${tipo}</option>`);
    });
    
    // Mostrar filtros se há mais de uma atividade
    if (atividades.length > 1) {
        $('#atividades-filters').fadeIn(300);
    }
}

// Função para criar atividades da sala
function criarAtividadesSala(atividades) {
    const atividadesGrid = $('#atividades-grid');
    atividadesGrid.empty();
    
    if (atividades.length === 0) {
        $('#no-atividades').show();
        $('#atividades-actions').hide();
        return;
    }
    
    $('#no-atividades').hide();
    
    atividades.forEach((atividade, index) => {
        const atividadeId = `atividade-${index}`;
        const isFavorita = verificarSeFavorita(atividade.titulo);
        
        // Processar informações da atividade
        const duracao = obterDuracaoEstimada(atividade);
        const nivel = atividade.nivel || 'Intermediário';
        const materiais = atividade.materiais_necessarios || 'Não especificado';
        
        const atividadeHTML = `
            <div class="atividade-box" id="${atividadeId}" data-index="${index}" data-aos="fade-up" data-aos-delay="${index * 100}">
                <!-- Cabeçalho da atividade -->
                <div class="atividade-header">
                    <div class="atividade-meta">
                        <span class="atividade-tipo">${atividade.tipo || 'Atividade'}</span>
                        ${isFavorita ? '<span class="atividade-favorita">⭐</span>' : ''}
                    </div>
                    <h3 class="atividade-titulo">${atividade.titulo || `Atividade ${index + 1}`}</h3>
                </div>
                
                <!-- Informações rápidas -->
                <div class="atividade-info">
                    <div class="info-item">
                        <span class="info-icon">⏱️</span>
                        <span class="info-text">${duracao}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-icon">📊</span>
                        <span class="info-text">${nivel}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-icon">👥</span>
                        <span class="info-text">${atividade.participantes || 'Flexível'}</span>
                    </div>
                </div>
                
                <!-- Descrição -->
                <div class="atividade-descricao">
                    ${limitarTexto(atividade.descricao, 150)}
                </div>
                
                <!-- Objetivos de aprendizagem (resumidos) -->
                ${atividade.objetivos_didaticos ? `
                    <div class="atividade-objetivos">
                        <h4>🎯 Objetivos</h4>
                        <p>${limitarTexto(Array.isArray(atividade.objetivos_didaticos) ? atividade.objetivos_didaticos.join(' • ') : atividade.objetivos_didaticos, 100)}</p>
                    </div>
                ` : ''}
                
                <!-- Materiais necessários (resumidos) -->
                <div class="atividade-materiais">
                    <h4>📦 Materiais</h4>
                    <p>${limitarTexto(materiais, 80)}</p>
                </div>
                
                <!-- Ações da atividade -->
                <div class="atividade-actions">
                    <button class="btn btn-primary" onclick="verDetalhesAtividade(${index})">
                        👁️ Ver Detalhes
                    </button>
                    <button class="btn btn-outline btn-favorita" onclick="toggleFavorita(${index})" title="${isFavorita ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                        ${isFavorita ? '⭐' : '☆'}
                    </button>
                </div>
            </div>
        `;
        
        atividadesGrid.append(atividadeHTML);
    });
    
    // Atualizar AOS para novos elementos
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
    
    // Mostrar ações das atividades
    $('#atividades-actions').fadeIn(300);
}

// Função para limitar texto
function limitarTexto(texto, limite) {
    if (!texto) return '';
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + '...';
}

// Função para obter duração estimada
function obterDuracaoEstimada(atividade) {
    if (atividade.tempo_estimado) {
        return atividade.tempo_estimado;
    }
    if (atividade.duracao) {
        return atividade.duracao;
    }
    return 'Não especificado';
}

// Função para verificar se atividade é favorita
function verificarSeFavorita(tituloAtividade) {
    const favoritas = JSON.parse(localStorage.getItem('atividades_favoritas') || '[]');
    return favoritas.includes(tituloAtividade);
}

// Função para alternar favorita
function toggleFavorita(index) {
    const atividade = atividadesFiltradas[index];
    let favoritas = JSON.parse(localStorage.getItem('atividades_favoritas') || '[]');
    const button = $(`#atividade-${index} .btn-favorita`);
    const favoritaIcon = $(`#atividade-${index} .atividade-favorita`);
    
    if (favoritas.includes(atividade.titulo)) {
        // Remover dos favoritos
        favoritas = favoritas.filter(fav => fav !== atividade.titulo);
        button.html('☆').attr('title', 'Adicionar aos favoritos');
        favoritaIcon.remove();
    } else {
        // Adicionar aos favoritos
        favoritas.push(atividade.titulo);
        button.html('⭐').attr('title', 'Remover dos favoritos');
        $(`#atividade-${index} .atividade-meta`).append('<span class="atividade-favorita">⭐</span>');
    }
    
    localStorage.setItem('atividades_favoritas', JSON.stringify(favoritas));
}

// Função para ver detalhes da atividade
function verDetalhesAtividade(index) {
    const atividade = atividadesFiltradas[index];
    atividadeAtualModal = index;
    
    // Atualizar título do modal
    $('#modal-atividade-titulo').text(atividade.titulo || `Atividade ${index + 1}`);
    
    // Criar conteúdo detalhado
    const objetivos = Array.isArray(atividade.objetivos_didaticos) 
        ? atividade.objetivos_didaticos.map(obj => `<li>${obj}</li>`).join('')
        : `<li>${atividade.objetivos_didaticos || 'Não especificado'}</li>`;
    
    const materiais = Array.isArray(atividade.materiais_necessarios)
        ? atividade.materiais_necessarios.map(mat => `<li>${mat}</li>`).join('')
        : `<li>${atividade.materiais_necessarios || 'Não especificado'}</li>`;
    
    const passos = Array.isArray(atividade.passo_a_passo)
        ? atividade.passo_a_passo.map((passo, i) => `<li><strong>Passo ${i + 1}:</strong> ${passo}</li>`).join('')
        : `<li>${atividade.passo_a_passo || 'Não especificado'}</li>`;
    
    const conteudoModal = `
        <div class="modal-atividade-content">
            <!-- Informações básicas -->
            <div class="modal-info-grid">
                <div class="info-card">
                    <h4>📊 Informações Gerais</h4>
                    <ul>
                        <li><strong>Tipo:</strong> ${atividade.tipo || 'Não especificado'}</li>
                        <li><strong>Duração:</strong> ${obterDuracaoEstimada(atividade)}</li>
                        <li><strong>Nível:</strong> ${atividade.nivel || 'Intermediário'}</li>
                        <li><strong>Participantes:</strong> ${atividade.participantes || 'Flexível'}</li>
                    </ul>
                </div>
                
                <div class="info-card">
                    <h4>🎯 Objetivos de Aprendizagem</h4>
                    <ul>${objetivos}</ul>
                </div>
            </div>
            
            <!-- Descrição completa -->
            <div class="modal-section">
                <h4>📝 Descrição</h4>
                <p>${atividade.descricao || 'Não especificado'}</p>
            </div>
            
            <!-- Materiais necessários -->
            <div class="modal-section">
                <h4>📦 Materiais Necessários</h4>
                <ul>${materiais}</ul>
            </div>
            
            <!-- Passo a passo -->
            ${atividade.passo_a_passo ? `
                <div class="modal-section">
                    <h4>🔢 Passo a Passo</h4>
                    <ol class="passo-a-passo">${passos}</ol>
                </div>
            ` : ''}
            
            <!-- Avaliação -->
            ${atividade.avaliacao ? `
                <div class="modal-section">
                    <h4>📋 Avaliação</h4>
                    <p>${atividade.avaliacao}</p>
                </div>
            ` : ''}
            
            <!-- Dicas adicionais -->
            ${atividade.dicas ? `
                <div class="modal-section">
                    <h4>💡 Dicas</h4>
                    <p>${atividade.dicas}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    $('#modal-atividade-body').html(conteudoModal);
    
    // Atualizar botão de favorita
    const isFavorita = verificarSeFavorita(atividade.titulo);
    $('#btn-marcar-favorita')
        .html(isFavorita ? '⭐ Remover dos Favoritos' : '☆ Marcar como Favorita')
        .attr('onclick', `toggleFavoritaModal(${index})`);
    
    // Mostrar modal
    $('#modal-atividade').fadeIn(300);
}

// Função para marcar como favorita no modal
function toggleFavoritaModal(index) {
    toggleFavorita(index);
    
    // Atualizar botão do modal
    const atividade = atividadesFiltradas[index];
    const isFavorita = verificarSeFavorita(atividade.titulo);
    $('#btn-marcar-favorita').html(isFavorita ? '⭐ Remover dos Favoritos' : '☆ Marcar como Favorita');
}

// Função para fechar modal de atividade
function fecharModalAtividade() {
    $('#modal-atividade').fadeOut(300);
    atividadeAtualModal = null;
}

// Função para filtrar atividades
function filtrarAtividades() {
    const tipoSelecionado = $('#filter-tipo').val();
    const duracaoSelecionada = $('#filter-duracao').val();
    
    atividadesFiltradas = atividadesOriginais.filter(atividade => {
        // Filtro por tipo
        if (tipoSelecionado && atividade.tipo !== tipoSelecionado) {
            return false;
        }
        
        // Filtro por duração
        if (duracaoSelecionada) {
            const duracao = obterDuracaoEstimada(atividade);
            const duracaoMinutos = extrairMinutos(duracao);
            
            switch (duracaoSelecionada) {
                case 'curta':
                    if (duracaoMinutos > 30) return false;
                    break;
                case 'media':
                    if (duracaoMinutos <= 30 || duracaoMinutos > 60) return false;
                    break;
                case 'longa':
                    if (duracaoMinutos <= 60) return false;
                    break;
            }
        }
        
        return true;
    });
    
    // Recriar grid com atividades filtradas
    criarAtividadesSala(atividadesFiltradas);
    atualizarContador(atividadesFiltradas.length);
}

// Função para extrair minutos de uma string de duração
function extrairMinutos(duracaoTexto) {
    if (!duracaoTexto) return 0;
    
    const match = duracaoTexto.match(/(\d+)/);
    if (match) {
        const numero = parseInt(match[1]);
        if (duracaoTexto.toLowerCase().includes('hora')) {
            return numero * 60;
        }
        return numero;
    }
    
    return 45; // Valor padrão se não conseguir extrair
}

// Função para limpar filtros
function limparFiltros() {
    $('#filter-tipo').val('');
    $('#filter-duracao').val('');
    atividadesFiltradas = [...atividadesOriginais];
    criarAtividadesSala(atividadesFiltradas);
    atualizarContador(atividadesFiltradas.length);
}

// Função para atualizar contador
function atualizarContador(quantidade) {
    const texto = quantidade === 1 ? '1 atividade encontrada' : `${quantidade} atividades encontradas`;
    $('#counter-text').text(texto);
    $('#atividades-counter').fadeIn(300);
}

// Função para exportar atividades
function exportarAtividades() {
    $('#modal-exportar').fadeIn(300);
}

// Função para fechar modal de exportação
function fecharModalExportar() {
    $('#modal-exportar').fadeOut(300);
}

// Funções de exportação
function exportarPDF() {
    alert('Funcionalidade de exportação PDF será implementada em breve!');
    fecharModalExportar();
}

function exportarTexto() {
    let texto = `ATIVIDADES PARA SALA DE AULA: ${window.dadosAtividades.titulo}\n\n`;
    
    atividadesFiltradas.forEach((atividade, index) => {
        texto += `${index + 1}. ${atividade.titulo}\n`;
        texto += `   Tipo: ${atividade.tipo || 'Não especificado'}\n`;
        texto += `   Duração: ${obterDuracaoEstimada(atividade)}\n`;
        texto += `   Descrição: ${atividade.descricao || 'Não especificado'}\n\n`;
    });
    
    // Criar download
    const blob = new Blob([texto], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atividades-${window.palavraAtual}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    fecharModalExportar();
}

function exportarJSON() {
    const dados = {
        conceito: window.palavraAtual,
        titulo: window.dadosAtividades.titulo,
        atividades: atividadesFiltradas,
        exportado_em: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atividades-${window.palavraAtual}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    fecharModalExportar();
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

// Função para mostrar erro
function mostrarErroAtividades(mensagem) {
    $("#loading").fadeOut(300, function() {
        if (mensagem) {
            $("#erro-atividades p:first").text(mensagem);
        }
        $("#erro-atividades").fadeIn(300);
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
