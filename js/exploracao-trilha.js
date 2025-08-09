/**
 * Exploração de Trilha - JavaScript com jQuery
 * Gerencia a interface da página de exploração de trilhas
 */

$(document).ready(function() {
    'use strict';

    // Namespace para organizar o código
    const ExploracaoTrilha = {
        // Cache dos elementos DOM
        $elements: {},
        
        // Instância do Cytoscape
        cytoscapeInstance: null,
        
        // Configurações
        config: {
            animationDuration: 400,
            cytoscapeResizeDelay: 300
        },

        /**
         * Inicializa a aplicação
         */
        init: function() {
            console.log('=== INICIALIZANDO EXPLORAÇÃO DE TRILHA ===');
            
            this.cacheElements();
            this.bindEvents();
            this.processURLParams();
            this.initializeControls();
            
            console.log('Exploração de trilha inicializada com sucesso');
        },

        /**
         * Faz cache dos elementos DOM mais utilizados
         */
        cacheElements: function() {
            this.$elements = {
                $trilhaPanel: $('#trilhaPanel'),
                $trilhaContainer: $('#trilhaContainer'),
                $mainContent: $('#mainContent'),
                $btnEsconder: $('#btnEsconder'),
                $btnShowTrilha: $('#btnShowTrilha'),
                $cytoscapeContainer: $('#mini-trilha-cytoscape')
            };
        },

        /**
         * Vincula eventos aos elementos
         */
        bindEvents: function() {
            // Eventos dos botões de controle
            this.$elements.$btnEsconder.on('click', () => this.esconderTrilha());
            this.$elements.$btnShowTrilha.on('click', () => this.mostrarTrilha());

            // Listener específico para mudanças no container do Cytoscape
            this.$elements.$cytoscapeContainer.on('transitionend', () => {
                console.log('Container Cytoscape redimensionado, ajustando visualização');
                setTimeout(() => {
                    this.resizeCytoscape();
                }, 100);
            });
        },

        /**
         * Extrai e processa parâmetros da URL
         */
        processURLParams: function() {
            const urlParams = new URLSearchParams(window.location.search);
            const params = {
                trilha: urlParams.get('trilha'),
                noClicado: urlParams.get('noClicado')
            };

            console.log('=== PARÂMETROS DA URL ===', Array.from(urlParams.entries()));
            console.log('Trilha:', params.trilha);
            console.log('Nó clicado (raw):', params.noClicado);

            if (params.noClicado && params.trilha) {
                this.initializeWithData(params);
            } else {
                this.initializeDemoMode();
            }
        },

        /**
         * Inicializa com dados da URL
         */
        initializeWithData: function(params) {
            try {
                const trilha = params.trilha;
                const noClicado = JSON.parse(decodeURIComponent(params.noClicado));

                if (trilha) {
                    console.log('=== CRIANDO VISUALIZAÇÃO COM DADOS ===');
                    this.createCytoscapeVisualization(trilha, noClicado);
                } else {
                    console.log('Grupo não especificado para criar visualização');
                }

            } catch (error) {
                console.error('Erro ao decodificar parâmetros:', error);
                this.initializeDemoMode();
            }
        },

        /**
         * Inicializa em modo demonstração
         */
        initializeDemoMode: function() {
            console.log('=== MODO DEMONSTRAÇÃO ===');
            console.log('Nenhum dado recebido - inicializando interface básica');
        },

        /**
         * Cria a visualização do Cytoscape
         */
        createCytoscapeVisualization: function(trilha, noClicado = null) {
            try {
                const cy = createCytoscape('mini-trilha-cytoscape', trilha);
                this.cytoscapeInstance = cy;
                window.cytoscapeInstance = cy; // Manter compatibilidade global
                
                console.log('Cytoscape criado com sucesso:', cy);

                // Destacar o nó clicado se disponível
                if (noClicado && noClicado.id) {
                    cy.ready(() => {
                        const clickedNode = cy.getElementById(noClicado.id);
                        if (clickedNode.length > 0) {
                            clickedNode.addClass('highlighted');
                            console.log('Nó destacado:', noClicado.id);
                        }
                    });
                }

                // Configurar eventos do Cytoscape
                this.bindCytoscapeEvents(cy);


            } catch (error) {
                console.error('Erro ao criar visualização Cytoscape:', error);
            }
        },

        /**
         * Vincula eventos específicos do Cytoscape
         */
        bindCytoscapeEvents: function(cy) {
            // Evento de clique nos nós
            cy.on('tap', 'node', (event) => {
                const node = event.target;
                console.log('Nó clicado:', node.data());
                
                // Aqui você pode adicionar lógica específica para cliques nos nós
                this.handleNodeClick(node);
            });

        },

        /**
         * Manipula cliques nos nós do Cytoscape
         */
        handleNodeClick: function(node) {
            // Remover destaque anterior
            this.cytoscapeInstance.$('node').removeClass('highlighted');
            
            // Destacar nó atual
            node.addClass('highlighted');
            
            console.log('Nó selecionado:', node.data().label || node.id());
        },

        /**
         * Inicializa os controles da trilha
         */
        initializeControls: function() {
            // Iniciar no estado visível padrão
            this.mostrarTrilha();
            console.log('Controles da trilha inicializados - Interface simplificada (apenas esconder/mostrar)');
        },

        /**
         * Esconde completamente a trilha
         */
        esconderTrilha: function() {
            this.$elements.$trilhaPanel
                .removeClass('small expanded')
                .addClass('hidden');

            this.$elements.$btnShowTrilha.show();
            console.log('Trilha escondida');
        },

        /**
         * Mostra a trilha no tamanho padrão
         */
        mostrarTrilha: function() {
            this.$elements.$trilhaPanel
                .removeClass('hidden expanded')
                .addClass('small');

            this.$elements.$btnShowTrilha.hide();
            console.log('Trilha mostrada');

            // Forçar redimensionamento do Cytoscape
            setTimeout(() => {
                this.resizeCytoscape();
            }, 100);
        },

        /**
         * Obtém o estado atual da trilha
         */
        getCurrentState: function() {
            if (this.$elements.$trilhaPanel.hasClass('hidden')) return 'hidden';
            return 'visible'; // Simplificado - apenas visível ou escondido
        },

        /**
         * Redimensiona o Cytoscape
         */
        resizeCytoscape: function() {
            if (this.cytoscapeInstance) {
                try {
                               
                    // Pequeno delay para garantir que o container já mudou de tamanho
                    setTimeout(() => {
                        this.cytoscapeInstance.resize();
                        this.cytoscapeInstance.fit();
                        this.cytoscapeInstance.center();
                    }, 50);
                    
                    console.log('Cytoscape redimensionado para o novo container');
                } catch (error) {
                    console.error('Erro ao redimensionar Cytoscape:', error);
                }
            }
        },


        /**
         * Utilitários públicos
         */
        utils: {
            /**
             * Log formatado para debug
             */
            log: function(message, data = null) {
                console.log(`[ExploracaoTrilha] ${message}`, data || '');
            },

            /**
             * Manipula parâmetros de URL
             */
            getURLParam: function(param) {
                const urlParams = new URLSearchParams(window.location.search);
                return urlParams.get(param);
            },

            /**
             * Detecta o estado atual da trilha
             */
            getCurrentTrilhaState: function() {
                return ExploracaoTrilha.getCurrentState();
            },

        },

        /**
         * Métodos públicos para controle externo
         */
        api: {
            /**
             * Esconde a trilha
             */
            hideTrilha: function() {
                ExploracaoTrilha.esconderTrilha();
            },

            /**
             * Mostra a trilha
             */
            showTrilha: function() {
                ExploracaoTrilha.mostrarTrilha();
            },

            /**
             * Obtém o estado atual
             */
            getTrilhaState: function() {
                return ExploracaoTrilha.getCurrentState();
            },

            /**
             * Redimensiona manualmente o Cytoscape
             */
            resizeCytoscape: function() {
                ExploracaoTrilha.resizeCytoscape();
            }
        }
    };

    // Inicializar a aplicação
    ExploracaoTrilha.init();

    // Expor para uso global se necessário
    window.ExploracaoTrilha = ExploracaoTrilha;
});
