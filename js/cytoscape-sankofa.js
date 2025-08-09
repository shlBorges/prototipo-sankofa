// Dados da rede

const nodesEpistemicidio = [ 
    { id: 'racializacao', label: 'Racialização', grupo: 'epistemicidio' },
    { id: 'colonialidadeSaber', label: 'Colonialidade do Saber', grupo: 'epistemicidio' },
    { id: 'branquitude', label: 'Branquitude', grupo: 'epistemicidio' },
    { id: 'epistemicidio', label: 'Epistemicídio', grupo: 'epistemicidio', importance: 'high' }
];

const nodesTecnologia = [ 
    { id: 'tecnologia', label: 'Tecnologia', grupo: 'tecnologia' },
    { id: 'ia', label: 'Inteligência Artificial', grupo: 'tecnologia' },
    { id: 'racismoAlgoritmico', label: 'Racismo Algorítmico', grupo: 'tecnologia' },
    { id: 'epistemicidioAlgoritmico', label: 'Epistemicídio Algorítmico', grupo: 'tecnologia', importance: 'high' }
];

const nodesEducacao = [
    { id: 'reexistencia', label: 'Reexistência', grupo: 'educacao' },
    { id: 'saberesNegros', label: 'Saberes Negros', grupo: 'educacao' },
    { id: 'ept', label: 'Educação Profissional e Tecnológica', grupo: 'educacao', importance: 'high' }
];

const edgesEpistemicidio = [
    { source: 'epistemicidio', target: 'branquitude' },
    { source: 'epistemicidio', target: 'colonialidadeSaber' },
    { source: 'epistemicidio', target: 'racializacao' }
];

const edgesTecnologia = [
    { source: 'epistemicidioAlgoritmico', target: 'tecnologia' },
    { source: 'epistemicidioAlgoritmico', target: 'ia' },
    { source: 'epistemicidioAlgoritmico', target: 'racismoAlgoritmico' }
];

const edgesEducacao = [
    { source: 'ept', target: 'reexistencia' },
    { source: 'ept', target: 'saberesNegros' }
];

// Enum para grupos de nós - disponível globalmente
const cySankofaGroup = Object.freeze({
    EPISTEMICIDIO: 'epistemicidio',
    TECNOLOGIA: 'tecnologia',
    EDUCACAO: 'educacao'
});

// Tornar o objeto acessível globalmente
window.cySankofaGroup = cySankofaGroup;


// Função para criar instância do Cytoscape de forma reutilizável
function createCytoscape(containerId, nodes) {
    console.log('=== INICIANDO CRIAÇÃO DO CYTOSCAPE ===', nodes);

    const nodesData = [];
    const edgesData = [];

    // Se nodes é um array, processar todos os grupos
    if (Array.isArray(nodes)) {
        nodes.forEach(grupo => {
            switch (grupo) {
                case cySankofaGroup.EPISTEMICIDIO:
                    nodesData.push(...nodesEpistemicidio);
                    edgesData.push(...edgesEpistemicidio);
                    break;
                case cySankofaGroup.TECNOLOGIA:
                    nodesData.push(...nodesTecnologia);
                    edgesData.push(...edgesTecnologia);
                    break;
                case cySankofaGroup.EDUCACAO:
                    nodesData.push(...nodesEducacao);
                    edgesData.push(...edgesEducacao);
                    break;
            }
        });
        
        // Adicionar conexões entre grupos principais se todos os grupos estão presentes
        if (nodes.length === 3) {
            edgesData.push(
                { source: 'epistemicidio', target: 'epistemicidioAlgoritmico' },
                { source: 'epistemicidioAlgoritmico', target: 'ept' }
            );
        }
    } else {
        // Se nodes é um valor individual, processar apenas um grupo
        switch (nodes) {
            case cySankofaGroup.EPISTEMICIDIO:
                nodesData.push(...nodesEpistemicidio);
                edgesData.push(...edgesEpistemicidio);
                break;
            case cySankofaGroup.TECNOLOGIA:
                nodesData.push(...nodesTecnologia);
                edgesData.push(...edgesTecnologia);
                break;
            case cySankofaGroup.EDUCACAO:
                nodesData.push(...nodesEducacao);
                edgesData.push(...edgesEducacao);
                break;
        }
    }
    

  return cytoscape({
    container: document.getElementById(containerId),
    elements: [
      ...nodesData.map(n => ({ 
        data: { id: n.id, label: n.label, importance: n.importance, grupo: n.grupo },
        classes: n.grupo
      })),
      ...edgesData.map(e => ({ data: { source: e.source, target: e.target } })),
    ],
    
    // Configurações de interação
    userPanningEnabled: true,
    userZoomingEnabled: true,
    autoungrabify: true,
    
    style: [
      { selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(label)',
          'color': '#fff',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': 12,
          'width': 100,
          'height': 100,
          'text-wrap': 'wrap',
          'text-max-width': 90
        }
      },
      { selector: 'node.epistemicidio',
        style: {
          'background-color': '#8B0000',
          'border-color': '#650000',
          'border-width': 2
        }
      },
      { selector: 'node.tecnologia',
        style: {
          'background-color': '#2E8B57',
          'border-color': '#1F5F3F',
          'border-width': 2
        }
      },
      { selector: 'node.educacao',
        style: {
          'background-color': '#4682B4',
          'border-color': '#2F4F4F',
          'border-width': 2
        }
      },
      { selector: 'node[importance = "high"]',
        style: {
          'width': 130,
          'height': 130,
          'font-size': 14,
          'font-weight': 'bold',
          'border-width': 3,
          'border-color': '#8B0000',
          'box-shadow': '0 0 20px rgba(220, 20, 60, 0.6)',
          'text-wrap': 'wrap',
          'text-max-width': 90,
        }
      },
      { selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#ccc',
          'curve-style': 'bezier'
        }
      },
      { selector: '.highlighted',
        style: {
          'background-color': '#ff6600',
          'line-color': '#ff6600',
          'transition-duration': '0.5s'
        }
      },
      { selector: '.hovered',
        style: {
          'width': 120,
          'height': 120,
          'border-width': 3,
          'border-color': '#ff6600',
          'transition-duration': '0.3s',
          'z-index': 999
        }
      },
      { selector: '.group-highlighted',
        style: {
          'border-width': 4,
          'border-opacity': 1,
          'transition-duration': '0.5s',
          'z-index': 998
        }
      }
    ],
    
    layout: { 
      name: 'cose', 
      animate: true,
      componentSpacing: 100,
      nodeOverlap: 20,
      idealEdgeLength: 100,
      edgeElasticity: 100,
      nestingFactor: 5
    }
  });
}
