// Sistema de Debug Centralizado
const DebugManager = {
    enabled: true, // Mudar para true para ativar logs em desenvolvimento
    
    log: function(message, data = null) {
        if (this.enabled) {
            if (data) {
                console.log(message, data);
            } else {
                console.log(message);
            }
        }
    },
    
    error: function(message, error = null) {
        if (error) {
            console.error(message, error);
        } else {
            console.error(message);
        }
    }
};

// Sistema de Navegação Centralizado
const NavigationManager = {
    navigateToHome: function() {
        // Detectar se estamos em uma subpasta
        const isInSubfolder = window.location.pathname.includes('/pages/');
        const homePath = 'index.html';
        window.location.href = homePath;
    },
    
    setupNavigationElement: function(element, destination = null) {
        const $element = $(element);
        if ($element.length > 0) {
            $element.on('click', (e) => {
                e.preventDefault();
                
                // Feedback visual
                $element.addClass('clicking');
                
                setTimeout(() => {
                    if (destination) {
                        window.location.href = destination;
                    } else {
                        this.navigateToHome();
                    }
                }, 150);
            });
        }
    }
};

// Gerenciador de Eventos Unificado
const EventManager = {
    debounceTimers: {},
    
    debounce: function(key, callback, delay = 200) {
        clearTimeout(this.debounceTimers[key]);
        this.debounceTimers[key] = setTimeout(callback, delay);
    },
    
    setupResponsiveListeners: function(callback) {
        // Listener unificado para resize
        $(window).on('resize', () => {
            this.debounce('resize', () => callback('resize'), 200);
        });
        
        // Listener para orientação
        $(window).on('orientationchange', () => {
            this.debounce('orientation', () => callback('orientation'), 500);
        });
        
        // Media query listeners
        if (window.matchMedia) {
            const queries = [
                { name: 'mobile-portrait', query: '(max-width: 768px) and (orientation: portrait)' },
                { name: 'mobile-landscape', query: '(max-width: 768px) and (orientation: landscape)' },
                { name: 'tablet-portrait', query: '(min-width: 769px) and (max-width: 1024px) and (orientation: portrait)' },
                { name: 'tablet-landscape', query: '(min-width: 769px) and (max-width: 1024px) and (orientation: landscape)' }
            ];
            
            queries.forEach(({ name, query }) => {
                const mq = window.matchMedia(query);
                mq.addListener((e) => {
                    if (e.matches) callback(name);
                });
            });
        }
    }
};

// Gerenciador de componentes modulares
const ComponentManager = {
    
    // Carregar header dinamicamente
    loadHeader: function() {
        // Detectar se estamos em uma subpasta (pages) ou na raiz
        const isInSubfolder = window.location.pathname.includes('/pages/');
        const headerPath = isInSubfolder ? '../components/header.html' : 'components/header.html';
        
        return $.get(headerPath)
            .done(function(headerHTML) {
                // Verificar se existe container específico para header
                const headerContainer = $('#header-container');
                if (headerContainer.length > 0) {
                    headerContainer.html(headerHTML);
                } else {
                    // Fallback: inserir no início do body
                    $('body').prepend(headerHTML);
                }
                
                // Sempre configurar título clicável
                ComponentManager.setupClickableTitle();
                
                DebugManager.log('Header carregado com sucesso');
            })
            .fail(function() {
                DebugManager.error('Erro ao carregar header');
                // Fallback: criar header básico via JavaScript
                ComponentManager.createFallbackHeader();
            });
    },
    
    // Sistema de templates modulares
    loadTemplate: function(templateName, replacements = {}) {
        const isInSubfolder = window.location.pathname.includes('/pages/');
        const templatePath = isInSubfolder ? `../components/${templateName}-template.html` : `components/${templateName}-template.html`;
        
        return $.get(templatePath)
            .done(function(templateHTML) {
                // Substituir placeholders
                let processedHTML = templateHTML;
                Object.keys(replacements).forEach(key => {
                    const placeholder = `{{${key}}}`;
                    processedHTML = processedHTML.replace(new RegExp(placeholder, 'g'), replacements[key]);
                });
                
                return processedHTML;
            })
            .fail(function() {
                DebugManager.error(`Erro ao carregar template: ${templateName}`);
                return null;
            });
    },
    
    // Carregar head completo da página
    loadPageHead: function(config = {}) {
        const defaults = {
            TITLE: 'Página',
            DESCRIPTION: 'Plataforma educacional sobre saberes ancestrais',
            FAVICON_PATH: '../',
            CSS_PATH: '../'
        };
        
        const settings = { ...defaults, ...config };
        
        return this.loadTemplate('head', settings)
            .done(function(headHTML) {
                $('head').html($(headHTML).find('head').html());
                $('#header-container').length || $('body').prepend('<header id="header-container"></header>');
            });
    },
    
    // Carregar footer completo da página
    loadPageFooter: function(config = {}) {
        const defaults = {
            JS_PATH: '../',
            PAGE_SCRIPT: 'conteudo'
        };
        
        const settings = { ...defaults, ...config };
        
        return this.loadTemplate('footer', settings)
            .done(function(footerHTML) {
                $('body').append(footerHTML);
            });
    },
    
    
    // Configurar funcionalidade do título clicável
    setupClickableTitle: function() {
        const clickableTitle = $('h1.clickable-title');
        
        if (clickableTitle.length > 0) {
            // Adicionar cursor pointer e configurar clique
            //clickableTitle.css('cursor', 'pointer');
            
            // Usar NavigationManager para navegação
            NavigationManager.setupNavigationElement(clickableTitle);
            
            // Event listener para hover (adicional ao CSS)
            /* clickableTitle.on('mouseenter', function() {
                $(this).addClass('hovering');
            }); */
            
           /*  clickableTitle.on('mouseleave', function() {
                $(this).removeClass('hovering clicking');
            }); */
            
            // Suporte a teclado (acessibilidade)
            clickableTitle.attr('tabindex', '0').attr('role', 'button').attr('aria-label', 'Voltar à página inicial');
            
            clickableTitle.on('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    $(this).click();
                }
            });
            
            DebugManager.log('Título clicável configurado');
        }
    }
};

// Sistema de Breadcrumb Modular
const BreadcrumbManager = {
    
    // Configurações padrão dos breadcrumbs
    config: {
        homeName: 'Início',
        homeLink: 'index.html',
        separator: '→',
        containerId: 'breadcrumb-nav',
        className: 'breadcrumb'
    },
    
    // Criar breadcrumb dinamicamente
    create: function(breadcrumbData, config = {}) {
        const settings = { ...this.config, ...config };
        
        const container = $(`#${settings.containerId}`);
        if (container.length === 0) {
            DebugManager.error('Container de breadcrumb não encontrado');
            return;
        }
        
        // Limpar conteúdo existente
        container.empty();
        
        // Sempre começar com Home
        container.append(`
            <a href="${settings.homeLink}" class="breadcrumb-link">
                ${settings.homeName}
            </a>
        `);
        
        // Adicionar itens do breadcrumb
        breadcrumbData.forEach((item, index) => {
            // Adicionar separador
            container.append(`<span class="breadcrumb-separator">${settings.separator}</span>`);
            
            if (item.isLast || index === breadcrumbData.length - 1) {
                // Item atual (não clicável)
                container.append(`<span class="breadcrumb-current">${item.name}</span>`);
            } else {
                // Item clicável
                const link = item.link || '#';
                const id = item.id ? `id="${item.id}"` : '';
                container.append(`<a href="${link}" ${id} class="breadcrumb-link">${item.name}</a>`);
            }
        });
        
        // Mostrar breadcrumb
        container.show();
        
        DebugManager.log('Breadcrumb criado:', breadcrumbData);
    },
    
    // Templates pré-definidos para páginas específicas
    templates: {
        conteudo: function(conceito = 'Conceito') {
            return [
                { name: conceito, isLast: true }
            ];
        },
        
        trilha: function(conceito = 'Conceito') {
            return [
                { name: conceito, link: '#', id: 'breadcrumb-conceito' },
                { name: 'Trilha de Aprofundamento', isLast: true }
            ];
        },
        
        atividades: function(conceito = 'Conceito') {
            return [
                { name: conceito, link: '#', id: 'breadcrumb-conceito' },
                { name: 'Atividades para Sala de Aula', isLast: true }
            ];
        }
    },
    
    // Inicializar breadcrumb baseado no tipo de página
    init: function(pageType, conceito = 'Conceito', customConfig = {}) {
        if (this.templates[pageType]) {
            const breadcrumbData = this.templates[pageType](conceito);
            this.create(breadcrumbData, customConfig);
            return true;
        } else {
            DebugManager.error('Tipo de página não encontrado para breadcrumb:', pageType);
            return false;
        }
    },
    
    // Atualizar conceito no breadcrumb dinamicamente
    updateConceito: function(novoConceito) {
        const conceitoElement = $('#breadcrumb-conceito');
        if (conceitoElement.length > 0) {
            conceitoElement.text(novoConceito);
        }
        
        const currentElement = $('.breadcrumb-current');
        if (currentElement.length > 0 && currentElement.text() === 'Conceito') {
            currentElement.text(novoConceito);
        }
        
        DebugManager.log('Conceito do breadcrumb atualizado para:', novoConceito);
    }
};

// Sistema de Layout Adaptativo Modularizado
const DeviceDetector = {
    detect: function() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isPortrait = height > width;
        const pixelRatio = window.devicePixelRatio || 1;
        const isTouch = 'ontouchstart' in window;
        
        return {
            width,
            height,
            isPortrait,
            isLandscape: !isPortrait,
            pixelRatio,
            isTouch,
            // Categorias de dispositivos
            isMobileSmall: width < 480,
            isMobileMedium: width >= 480 && width < 768,
            isTabletSmall: width >= 768 && width < 900,
            isTabletLarge: width >= 900 && width < 1200,
            isDesktop: width >= 1200,
            // Contextos específicos
            isMobilePortrait: width < 768 && isPortrait,
            isMobileLandscape: width < 768 && !isPortrait,
            isTabletPortrait: width >= 768 && width < 1200 && isPortrait,
            isTabletLandscape: width >= 768 && width < 1200 && !isPortrait
        };
    }
};

const LayoutCalculator = {
    // Configurações por tipo de dispositivo
    deviceLayouts: {
        mobilePortrait: { columns: 1, cardSize: 'medium', spacing: 'normal', showProgress: true, enableSwipe: true },
        mobileLandscape: { columns: 3, cardSize: 'compact', spacing: 'tight', compactMode: true },
        tabletPortrait: { columns: 1, cardSize: 'large', spacing: 'spacious', showProgress: true, enableSwipe: true },
        tabletLandscape: { columns: 3, cardSize: 'medium', spacing: 'normal' },
        desktop: { columns: 3, cardSize: 'medium', spacing: 'normal' }
    },
    
    getBestLayout: function(cardCount = 3) {
        const device = DeviceDetector.detect();
        let layoutType = 'desktop';
        
        // Determinar tipo de layout
        if (device.isMobilePortrait) layoutType = 'mobilePortrait';
        else if (device.isMobileLandscape) layoutType = 'mobileLandscape';
        else if (device.isTabletPortrait) layoutType = 'tabletPortrait';
        else if (device.isTabletLandscape) layoutType = 'tabletLandscape';
        
        // Obter configuração base
        let layout = { ...this.deviceLayouts[layoutType] };
        
        // Ajustes específicos para desktop
        if (layoutType === 'desktop') {
            layout.columns = Math.min(cardCount, 3);
            layout.cardSize = device.width > 1400 ? 'large' : 'medium';
            layout.spacing = device.width > 1200 ? 'spacious' : 'normal';
        }
        
        // Definir padrões para propriedades não definidas
        layout = {
            showProgress: false,
            enableSwipe: false,
            compactMode: false,
            ...layout
        };
        
        return { ...layout, device };
    }
};

// Sistema de Layout Adaptativo
const AdaptiveLayoutManager = {
    
    // Aplicar layout aos content-boxes (simplificado)
    applyLayout: function(cardCount) {
        const layout = LayoutCalculator.getBestLayout(cardCount);
        const grid = $('.conteudo-grid');
        
        // Remover classes anteriores
        grid.removeClass('layout-1col layout-2col layout-3col size-compact size-medium size-large spacing-tight spacing-normal spacing-spacious compact-mode');
        
        // Aplicar layout baseado no número de colunas
        const columnClass = `layout-${layout.columns}col`;
        grid.addClass(columnClass);
        
        // Aplicar tamanho e espaçamento
        grid.addClass(`size-${layout.cardSize} spacing-${layout.spacing}`);
        
        if (layout.compactMode) {
            grid.addClass('compact-mode');
        }
        
        // Configurar recursos específicos do mobile
        this.configureMobileFeatures(layout, cardCount);
        
        // Salvar configuração atual
        this.currentLayout = layout;
        
        DebugManager.log('Layout aplicado', layout);
        return layout;
    },
    
    // Configurar recursos específicos do mobile
    configureMobileFeatures: function(layout, cardCount) {
        // Configurar indicador de progresso
        if (layout.showProgress && layout.columns === 1 && cardCount > 1) {
            this.createProgressIndicator(cardCount);
        } else {
            $('.progress-indicator').remove();
        }
        
        // Configurar swipe
        if (layout.enableSwipe && layout.columns === 1) {
            this.enableSwipeNavigation();
        } else {
            this.swipeEnabled = false;
        }
    },
    
    // Criar indicador de progresso
    createProgressIndicator: function(totalCards) {
        if ($('.progress-indicator').length > 0) return;
        
        const progressHTML = `
            <div class="progress-indicator" data-aos="fade-in">
                <div class="progress-dots">
                    ${Array.from({length: totalCards}, (_, i) => 
                        `<span class="progress-dot" data-card="${i}"></span>`
                    ).join('')}
                </div>
                <div class="progress-text">
                    <span class="current-card">1</span> de <span class="total-cards">${totalCards}</span>
                </div>
            </div>
        `;
        
        $('.instrucao-cards').after(progressHTML);
        this.updateProgress(0);
    },
    
    // Atualizar indicador de progresso
    updateProgress: function(currentIndex) {
        $('.progress-dot').removeClass('active');
        $(`.progress-dot[data-card="${currentIndex}"]`).addClass('active');
        $('.current-card').text(currentIndex + 1);
    },
    
    // Habilitar navegação por swipe
    enableSwipeNavigation: function() {
        if (this.swipeEnabled) return;
        
        let startY = 0;
        let currentCardIndex = 0;
        const cards = $('.content-box');
        
        $('.conteudo-grid').on('touchstart', function(e) {
            startY = e.originalEvent.touches[0].clientY;
        });
        
        $('.conteudo-grid').on('touchmove', function(e) {
            e.preventDefault(); // Prevenir scroll padrão durante swipe
        });
        
        $('.conteudo-grid').on('touchend', function(e) {
            const endY = e.originalEvent.changedTouches[0].clientY;
            const diff = startY - endY;
            
            if (Math.abs(diff) > 50) { // Threshold mínimo para swipe
                if (diff > 0 && currentCardIndex < cards.length - 1) {
                    // Swipe para cima - próximo card
                    currentCardIndex++;
                    AdaptiveLayoutManager.scrollToCard(currentCardIndex);
                } else if (diff < 0 && currentCardIndex > 0) {
                    // Swipe para baixo - card anterior
                    currentCardIndex--;
                    AdaptiveLayoutManager.scrollToCard(currentCardIndex);
                }
            }
        });
        
        this.swipeEnabled = true;
    },
    
    // Scroll suave para um card específico
    scrollToCard: function(index) {
        const card = $(`.content-box:eq(${index})`);
        if (card.length) {
            $('html, body').animate({
                scrollTop: card.offset().top - 100
            }, 400);
            this.updateProgress(index);
        }
    },
    
    // Listener aprimorado para mudanças de orientação/tamanho
    setupResponsiveListener: function() {
        EventManager.setupResponsiveListeners((trigger) => {
            this.handleLayoutChange(trigger);
        });
    },
    
    // Manipular mudanças de layout com contexto
    handleLayoutChange: function(trigger) {
        const cardCount = $('.content-box').length;
        if (cardCount > 0) {
            DebugManager.log(`Layout change triggered by: ${trigger}`);
            
            // Aplicar novo layout
            const layout = this.applyLayout(cardCount);
            
            // Reinicializar bibliotecas externas
            if (typeof AOS !== 'undefined') {
                setTimeout(() => AOS.refresh(), 100);
            }
            
            DebugManager.log('New layout applied', {
                trigger,
                device: layout.device,
                columns: layout.columns,
                cardSize: layout.cardSize,
                orientation: layout.device.isPortrait ? 'portrait' : 'landscape'
            });
        }
    },
    
    // Inicializar sistema adaptativo
    init: function() {
        this.setupResponsiveListener();
        DebugManager.log('Sistema de Layout Adaptativo inicializado');
    }
};

// Função de conveniência para páginas principais
function initHomePage() {
    AdaptiveLayoutManager.init();
    return ComponentManager.loadHeader();
}

// Função de conveniência para páginas de conteúdo (usando breadcrumb)
function initContentPage() {
    AdaptiveLayoutManager.init();
    return ComponentManager.loadHeader();
}

// Função utilitária para configurar título clicável em qualquer página
function setupClickableTitleStandalone() {
    // Aguardar DOM estar pronto
    $(document).ready(function() {
        ComponentManager.setupClickableTitle();
    });
}