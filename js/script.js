// Controles principais da aplicação
$(document).ready(function() {
    // Carregar header da página principal (sem botão voltar)
    initHomePage();
    
    console.log("SANKOFA - Aplicação iniciada");
});

// Função para normalizar o nome da palavra para usar como nome do arquivo
function normalizarPalavra(palavra) {
    return palavra
        .toLowerCase() // Converte para minúsculas
        .normalize('NFD') // Decompõe os caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
        .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais e espaços
        .trim(); // Remove espaços extras
}