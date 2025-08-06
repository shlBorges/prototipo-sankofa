// Gerenciador de componentes modulares
const ComponentManager = {
    
    // Carregar header dinamicamente
    loadHeader: function(showBackButton = false) {
        return $.get('components/header.html')
            .done(function(headerHTML) {
                // Inserir header no body
                $('body').prepend(headerHTML);
                
                // Configurar visibilidade do botão voltar
                if (showBackButton) {
                    $('#voltar_home').show();
                    // Event listener para o botão de voltar
                    $('#voltar_home').on('click', function() {
                        window.location.href = 'index.html';
                    });
                }
                
                console.log('Header carregado com sucesso');
            })
            .fail(function() {
                console.error('Erro ao carregar header');
                // Fallback: criar header básico via JavaScript
                ComponentManager.createFallbackHeader(showBackButton);
            });
    },
    
    // Header de fallback caso o arquivo não carregue
    createFallbackHeader: function(showBackButton = false) {
        const backButtonHTML = showBackButton ? 
            '<button id="voltar_home">← Voltar à Nuvem</button>' : 
            '<button id="voltar_home" style="display: none;">← Voltar à Nuvem</button>';
            
        const headerHTML = `
            <header>
                ${backButtonHTML}
                <h1>SANKOFA – Saberes Ancestrais para o Futuro Digital</h1>
            </header>
        `;
        
        $('body').prepend(headerHTML);
        
        if (showBackButton) {
            $('#voltar_home').on('click', function() {
                window.location.href = 'index.html';
            });
        }
        
        console.log('Header fallback criado');
    }
};

// Função de conveniência para páginas principais
function initHomePage() {
    return ComponentManager.loadHeader(false);
}

// Função de conveniência para páginas de conteúdo
function initContentPage() {
    return ComponentManager.loadHeader(true);
}
