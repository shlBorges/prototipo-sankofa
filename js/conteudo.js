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
        console.log("Carregando conteúdo para:", palavra, "->", nomeArquivo);
        
        carregarConteudo(nomeArquivo);
    } else {
        // Se não há parâmetro, mostrar erro
        mostrarErro("Nenhuma palavra especificada.");
    }
}

// Função para carregar conteúdo do JSON
function carregarConteudo(nomeArquivo) {
    $("#loading").show();
    $("#conteudo-estruturado").hide();
    $("#erro-conteudo").hide();
    
    $.getJSON(`dados/${nomeArquivo}.json`)
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
    $("#titulo-principal").text(data.titulo);
    
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
            ? conteudo.objetivos_didaticos.join(' • ')
            : conteudo.objetivos_didaticos || '';
        
        // Processar referências
        const referencias = Array.isArray(conteudo.referencias)
            ? conteudo.referencias.map(ref => `<li>${ref}</li>`).join('')
            : '';
        
        const boxHTML = `
            <div class="content-box" id="${boxId}">
                <div class="box-header" onclick="toggleBox('${boxId}')">
                    <h3 class="box-title">${conteudo.titulo}</h3>
                    <p class="box-objetivos">${objetivos}</p>
                    <span class="expand-icon">▼</span>
                </div>
                <div class="box-content">
                    <div class="conteudo-textual">
                        ${conteudo.conteudo_textual}
                    </div>
                    ${referencias ? `
                        <div class="referencias-section">
                            <h4>📚 Referências para Aprofundamento</h4>
                            <ul class="referencias-list">
                                ${referencias}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        $("#boxes-conteudo").append(boxHTML);
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

// Função para alternar expansão dos boxes
function toggleBox(boxId) {
    const box = $(`#${boxId}`);
    const content = box.find('.box-content');
    
    if (box.hasClass('expanded')) {
        // Fechar box
        content.slideUp(300);
        box.removeClass('expanded');
    } else {
        // Abrir box
        content.slideDown(300);
        box.addClass('expanded');
    }
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

// Função para mostrar atividades de trilha
function mostrarAtividadesTrilha() {
    $("#escolha-atividades").fadeOut(300, function() {
        criarBoxesTrilha(window.dadosConteudo.atividades_trilha);
        $("#secao-trilha").fadeIn(300);
    });
}

// Função para mostrar atividades discente
function mostrarAtividadesDiscente() {
    $("#escolha-atividades").fadeOut(300, function() {
        criarBoxesAtividades(window.dadosConteudo.atividades_discente);
        $("#secao-atividades").fadeIn(300);
    });
}

// Função para voltar à escolha
function voltarEscolha() {
    $("#secao-trilha, #secao-atividades").fadeOut(300, function() {
        $("#escolha-atividades").fadeIn(300);
    });
}

// Função para criar boxes de trilha
function criarBoxesTrilha(atividades) {
     
    $("#boxes-trilha").empty(); // Limpar antes de adicionar novas atividades

    atividades.forEach((atividade, index) => {
        const objetivos = Array.isArray(atividade.objetivos_didaticos) 
            ? atividade.objetivos_didaticos.join(' • ')
            : atividade.objetivos_didaticos || '';

        const boxHTML = `
            <div class="trilha-card">
                <div class="trilha-titulo">${atividade.titulo}</div>
                <div class="trilha-objetivos">${objetivos}</div>
                <div class="trilha-descricao">${atividade.descricao}</div>
                <div class="trilha-actions">
                    <button class="btn-trilha-concluir" onclick="concluirAtividadeTrilha(${index})">
                        Concluir e ir para trilha "${atividade.trilha_relacionada}"
                    </button>
                </div>
            </div>
        `;
        
        $("#boxes-trilha").append(boxHTML);
    });
}


// Função para concluir atividade de trilha (sem modal)
function concluirAtividadeTrilha(index) {
    const atividade = window.dadosConteudo.atividades_trilha[index];
    const button = $(`#boxes-trilha .trilha-card:eq(${index}) .btn-trilha-concluir`);
    
    // Alterar visual do botão para indicar conclusão
    button.text("✅ Concluindo...")
          .prop("disabled", true)
          .addClass("btn-concluindo");
    
    // Adicionar efeito visual ao box
    const box = button.closest('.trilha-card');
    box.addClass('trilha-concluida');
    
    // Mostrar mensagem e redirecionar após um breve delay
    setTimeout(() => {
        alert(`🎉 Atividade concluída! Redirecionando para "${atividade.trilha_relacionada}"...`);
        
        // Redirecionar para a trilha relacionada
        const trilhaRelacionada = normalizarPalavra(atividade.trilha_relacionada);
        window.location.href = `conteudo.html?palavra=${encodeURIComponent(atividade.trilha_relacionada)}`;
    }, 500);
}

