// Script para página de conteúdo separada
$(document).ready(function() {
    // Carregar header da página de conteúdo (com botão voltar)
    initContentPage().then(function() {
        // Carregar conteúdo baseado no parâmetro da URL após header estar pronto
        carregarConteudoPorParametro();
    });
});

// Função para carregar conteúdo baseado no parâmetro da URL
function carregarConteudoPorParametro() {
    // Obter parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const palavra = urlParams.get('palavra');
    
    if (palavra) {
        const nomeArquivo = normalizarPalavra(palavra);
        DebugManager.log("Carregando conteúdo para:", palavra, "->", nomeArquivo);
        
        // Atualizar breadcrumb
        atualizarBreadcrumb(palavra);
        
        carregarConteudo(nomeArquivo);
    } else {
        // Se não há parâmetro, mostrar erro
        mostrarErro("Nenhuma palavra especificada.");
    }
}

// Função para atualizar breadcrumb
function atualizarBreadcrumb(palavra) {
    // Capitalizar primeira letra
    const palavraFormatada = palavra.charAt(0).toUpperCase() + palavra.slice(1);
    
    // Usar BreadcrumbManager para criar o breadcrumb
    BreadcrumbManager.init('conteudo', palavraFormatada);
}

// Função para carregar conteúdo do JSON
function carregarConteudo(nomeArquivo) {
    $("#loading").show();
    $("#conteudo-estruturado").hide();
    $("#erro-conteudo").hide();
    
    $.getJSON(`../dados/${nomeArquivo}.json`)
        .done(function(data) {
            console.log("Dados carregados:", data);
            
            // Ocultar loading
            $("#loading").fadeOut(300, function() {
                // Processar dados baseado na estrutura
                processarConteudoEstruturado(data, nomeArquivo);
                $("#conteudo-estruturado").fadeIn(300);
            });
        })
        .fail(function(error) {
            console.error("Erro ao carregar conteúdo:", error);
            mostrarErro("Erro ao carregar conteúdo.");
        });
}

// Função para processar conteúdo estruturado
function processarConteudoEstruturado(data, nomeArquivo) {
    // Definir título principal
    //$("#titulo-principal").text(data.titulo);
    
    // Limpar containers
    $("#boxes-conteudo").empty();
    $("#boxes-atividades").empty();
    $("#boxes-trilha").empty();
    
    // Armazenar dados globalmente para uso posterior
    window.dadosConteudo = data;
    
    // Processar conteúdos
    if (data.conteudos && data.conteudos.length > 0) {
        criarBoxesConteudo(data.conteudos);
    }
    
    // Verificar se há atividades para mostrar a escolha
    if ((data.atividades_trilha && data.atividades_trilha.length > 0) || 
        (data.atividades_discente && data.atividades_discente.length > 0)) {
        // Mostrar escolha após um delay para dar tempo do usuário ler
        setTimeout(() => {
            $("#escolha-atividades").fadeIn(300);
        }, 1000);
    }
}

// Função para criar boxes de conteúdo
function criarBoxesConteudo(conteudos) {
    conteudos.forEach((conteudo, index) => {
        const boxId = `content-box-${index}`;
        
        // Processar objetivos didáticos
        const objetivos = Array.isArray(conteudo.objetivos_didaticos) 
            ? conteudo.objetivos_didaticos.join(' <br/> ')
            : conteudo.objetivos_didaticos || '';
        
        // Processar referências
        const referencias = Array.isArray(conteudo.referencias)
            ? conteudo.referencias.map(ref => `<li>${ref}</li>`).join('')
            : '';
        
        const boxHTML = `
            <div class="content-box" id="${boxId}" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="box-header" onclick="toggleBox('${boxId}')" tabindex="0" onkeypress="if(event.key==='Enter' || event.key===' ') toggleBox('${boxId}')">
                    <h3 class="box-title">${conteudo.titulo}</h3>
                    <span class="expand-icon">⛶</span>
                <p class="box-objetivos">${objetivos}</p>
                </div>
            </div>
        `;
        
        $("#boxes-conteudo").append(boxHTML);
    });
    
    // Atualizar AOS para os novos elementos
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
    
    // Aplicar layout adaptativo baseado no número de cards
    if (typeof AdaptiveLayoutManager !== 'undefined') {
        AdaptiveLayoutManager.applyLayout(conteudos.length);
        
        // Configurar listeners para os dots de progresso
        $('.progress-dot').on('click', function() {
            const cardIndex = parseInt($(this).data('card'));
            AdaptiveLayoutManager.scrollToCard(cardIndex);
        });
        
        // Observador de scroll para atualizar progresso
        if (AdaptiveLayoutManager.currentLayout && AdaptiveLayoutManager.currentLayout.showProgress) {
            setupScrollObserver();
        }
    }
}

// Configurar observador de scroll para atualizar progresso automaticamente
function setupScrollObserver() {
    const cards = $('.content-box');
    const options = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const cardIndex = cards.index(entry.target);
                if (cardIndex >= 0 && typeof AdaptiveLayoutManager !== 'undefined') {
                    AdaptiveLayoutManager.updateProgress(cardIndex);
                }
            }
        });
    }, options);
    
    cards.each(function() {
        observer.observe(this);
    });
}

// Função para criar boxes de atividades
function criarBoxesAtividades(atividades) {

    $("#boxes-atividades").empty(); // Limpar antes de adicionar novas atividades
    
    atividades.forEach((atividade, index) => {
        const boxHTML = `
            <div class="atividade-box">
                <span class="atividade-tipo">${atividade.tipo}</span>
                <h3 class="atividade-titulo">${atividade.titulo || 'Atividade ' + (index + 1)}</h3>
                <div class="atividade-descricao">
                    ${atividade.descricao}
                </div>
            </div>
        `;
        
        $("#boxes-atividades").append(boxHTML);
    });
}

// Função para alternar expansão dos boxes (agora fullscreen)
function toggleBox(boxId) {
    const box = $(`#${boxId}`);
    
    if (box.hasClass('fullscreen-mode')) {
        // Fechar fullscreen
        closeFullscreen(boxId);
    } else {
        // Abrir fullscreen
        openFullscreen(boxId);
    }
}

// Função para abrir box em fullscreen
function openFullscreen(boxId) {
    const box = $(`#${boxId}`);
    const boxData = box.data('content-data');
    
    // Recuperar dados do conteúdo
    const conteudos = window.dadosConteudo.conteudos;
    const index = parseInt(boxId.replace('content-box-', ''));
    const conteudo = conteudos[index];
    
    if (!conteudo) return;
    
    // Processar objetivos e referências
    const objetivos = Array.isArray(conteudo.objetivos_didaticos) 
        ? conteudo.objetivos_didaticos.join(' • ')
        : conteudo.objetivos_didaticos || '';
    
    const referencias = Array.isArray(conteudo.referencias)
        ? conteudo.referencias.map(ref => `<li>${ref}</li>`).join('')
        : '';
    
    // Criar overlay
    const overlay = $('<div class="fullscreen-overlay"></div>');
    $('body').append(overlay);
    
    // Criar modal fullscreen
    const fullscreenHTML = `
        <div class="content-box-fullscreen" id="fullscreen-${boxId}">
            <div class="fullscreen-header">
                <button class="fullscreen-close" onclick="closeFullscreen('${boxId}')" tabindex="0">
                    <span>✕</span> Fechar
                </button>
                <h1 class="fullscreen-title">${conteudo.titulo}</h1>
                <div style="width: 80px;"></div> <!-- Spacer para centralizar título -->
            </div>
            <div class="fullscreen-content">
                               
                <div class="fullscreen-texto">
                    ${conteudo.conteudo_textual}
                </div>
                
                ${referencias ? `
                    <div class="fullscreen-referencias">
                        <h4>📚 Referências para Aprofundamento</h4>
                        <ul>
                            ${referencias}
                        </ul>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    $('body').append(fullscreenHTML);
    box.addClass('fullscreen-mode');
    
    // Prevenir scroll do body
    $('body').css('overflow', 'hidden');
    
    // Adicionar listener para ESC
    $(document).on('keydown.fullscreen', function(e) {
        if (e.key === 'Escape') {
            closeFullscreen(boxId);
        }
    });
    
    // Listener para click no overlay
    $('.fullscreen-overlay').on('click', function() {
        closeFullscreen(boxId);
    });
    
    // Focar no botão fechar para acessibilidade
    setTimeout(() => {
        $(`#fullscreen-${boxId} .fullscreen-close`).focus();
    }, 100);
}

// Função para fechar fullscreen
function closeFullscreen(boxId) {
    const box = $(`#${boxId}`);
    
    // Remover modal e overlay
    $(`#fullscreen-${boxId}`).fadeOut(200, function() {
        $(this).remove();
    });
    
    $('.fullscreen-overlay').fadeOut(200, function() {
        $(this).remove();
    });
    
    // Remover classe e restaurar scroll
    box.removeClass('fullscreen-mode');
    $('body').css('overflow', '');
    
    // Remover listener ESC
    $(document).off('keydown.fullscreen');
    
    // Retornar foco ao box original
    setTimeout(() => {
        box.find('.box-header').focus();
    }, 250);
}

// Função para mostrar erro
function mostrarErro(mensagem) {
    $("#loading").fadeOut(300, function() {
        if (mensagem) {
            $("#erro-conteudo p:first").text(mensagem);
        }
        $("#erro-conteudo").fadeIn(300);
    });
}

// Função para normalizar o nome da palavra para usar como nome do arquivo
function normalizarPalavra(palavra) {
    return palavra
        .toLowerCase() // Converte para minúsculas
        .normalize('NFD') // Decompõe os caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
        .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais e espaços
        .trim(); // Remove espaços extras
}

// Variáveis globais para controle (mantidas por compatibilidade)
let atividadeAtualTrilha = null;

// Função para mostrar atividades de trilha - agora redireciona para página especializada
function mostrarAtividadesTrilha() {
    const urlParams = new URLSearchParams(window.location.search);
    const palavra = urlParams.get('palavra');
    
    if (palavra) {
        // Redirecionar para página especializada de trilhas
        window.location.href = `trilha.html?palavra=${encodeURIComponent(palavra)}&origem=conteudo`;
    } else {
        DebugManager.error("Palavra não encontrada nos parâmetros da URL");
        mostrarErro("Erro ao carregar trilha de aprofundamento.");
    }
}

// Função para mostrar atividades discente - agora redireciona para página especializada
function mostrarAtividadesDiscente() {
    const urlParams = new URLSearchParams(window.location.search);
    const palavra = urlParams.get('palavra');
    
    if (palavra) {
        // Redirecionar para página especializada de atividades
        window.location.href = `atividades.html?palavra=${encodeURIComponent(palavra)}&origem=conteudo&tipo=discente`;
    } else {
        DebugManager.error("Palavra não encontrada nos parâmetros da URL");
        mostrarErro("Erro ao carregar atividades para sala de aula.");
    }
}

// Função para voltar à escolha
function voltarEscolha() {
    $("#secao-trilha, #secao-atividades").fadeOut(300, function() {
        $("#escolha-atividades").fadeIn(300);
    });
}

// Função para voltar para a nuvem de palavras (página inicial)
function voltarParaNuvem() {
    window.location.href = 'index.html';
}

// Função para normalizar o nome da palavra para usar como nome do arquivo
function normalizarPalavra(palavra) {
    return palavra
        .toLowerCase() // Converte para minúsculas
        .normalize('NFD') // Decompõe os caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
        .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais e espaços
        .trim(); // Remove espaços extras
}

