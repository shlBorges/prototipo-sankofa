// Configuração e inicialização do AnyChart
anychart.onDocumentReady(function () {

    // Data  
    // Array com 3 colunas, a palavra, um valor, uma categoria
    var data = [
        { "x": "Epistemicídio", "value": 1200, category: "o poder colonial" },
        { "x": "Colonialidade do Saber", "value": 400, category: "o poder colonial" },
        { "x": "Branquitude", "value": 700, category: "o poder colonial" },
        { "x": "Tecnologia e Poder", "value": 600, category: "o poder atual" },
        { "x": "Racismo Algorítmico", "value": 950, category: "o poder atual" },
        { "x": "IA", "value": 350, category: "o poder atual" },
        { "x": "Saberes Negros", "value": 300, category: "o poder insurgente" },
        { "x": "EPT", "value": 500, category: "o poder insurgente" },
        { "x": "Reexistência", "value": 800, category: "o poder insurgente" },
    /* {"x": "Sankofa", "value": 10, category: "DEV"} */,
    ];

    // Criando nosso grafico de Nuvem de Etiquetas
    var chart = anychart.tagCloud(data);
    chart.title().enabled(false); // Desabilitando o titulo do grafico

    // Definindo o titulo
    //chart.title('SANKOFA')  

    //Definir o angulo de cada palavra
    chart.angles([0])

    // Controlando espaçamento individual entre palavras
    chart.textSpacing(3); // Espaçamento extra ao redor de cada palavra 

    // Ativando as cores por valor
    chart.colorScale(anychart.scales.ordinalColor());

    // Definindo cores com maior contraste (marrom escuro a bronze dourado)
    chart.normal().fill(function () {
        if (this.value === 1200) return "#702c05"; // Epistemicídio - marrom escuro
        if (this.value === 950) return "#8b4513"; // Racismo Algorítmico - marrom médio
        if (this.value === 800) return "#a0522d"; // Reexistência - marrom claro
        if (this.value === 700) return "#cd853f"; // Branquitude - peru/bronze
        if (this.value === 600) return "#daa520"; // Tecnologia e Poder - dourado escuro
        if (this.value === 500) return "#d4af37"; // EPT - dourado clássico
        if (this.value === 400) return "#c9a96e"; // Colonialidade do Saber - bronze claro
        if (this.value === 350) return "#c19a6b"; // IA - bronze médio
        if (this.value === 300) return "#b8860b"; // Saberes Negros - bronze dourado
        return "#b8860b"; // cor padrão
    });

    // definindo a cor do background
    chart.background().fill({ keys: ["#f8f8f8"] });
    //chart.background().fill({  keys: ["#fff", "#66f", "#fff"],   keys: ["#000", "#000", "#000"],  angle: 130,});

    // montando o grafico
    chart.container("container");
    chart.draw();

    // Configurando tooltip para mostrar a categoria
    var formatter = "{%category}";
    var tooltip = chart.tooltip();
    tooltip.format(formatter);

    // Adicionando eventos de clique nas palavras
    chart.listen("pointClick", function (e) {
        // Dados da palavra clicada
        const palavra = e.point.get("x");
        const categoria = e.point.get("category");
        const valor = e.point.get("value");

        // Ações possíveis ao clicar
        console.log("Palavra clicada:", palavra);

        if (palavra) {
            // Redirecionar para página de conteúdo com parâmetro
            window.location.href = `conteudo.html?palavra=${encodeURIComponent(normalizarPalavra(palavra))}`;
        }
    });

});
