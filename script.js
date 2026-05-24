/* Agrinho — scripts úteis: acessibilidade, leitura de página e pequenas melhorias interativas */

(function () {
  "use strict"; // Ativa o modo estrito do JS, que força o código a ser escrito de forma mais segura, evitando erros comuns.

  // Estado e persistência local
  const storage = window.localStorage; // Guarda a referência do localStorage para salvar as preferências do usuário no navegador.
  const state = {
    // Tenta recuperar o tamanho da fonte salvo (ou usa "100" por padrão) e transforma em número inteiro.
    font: parseInt(storage.getItem("agrinho-font") || "100", 10),
    // Verifica se o modo escuro estava ativo ("true") da última vez que o usuário visitou a página.
    dark: storage.getItem("agrinho-dark") === "true",
  };

  // Aplicador de Escala de Fonte
  function applyFont() {
    const scale = state.font / 100; // Transforma a porcentagem da fonte (ex: 110) em um multiplicador decimal (ex: 1.1).
    document.documentElement.style.fontSize = 16 * scale + "px"; // Aplica o novo tamanho de fonte base diretamente na tag HTML principal.
  }

  // Aplicador de Modo Claro/Escuro Puro e Eficiente
  function applyDark() {
    if (state.dark) {
      document.documentElement.classList.add("dark-mode"); // Se o estado for escuro, adiciona a classe "dark-mode" na tag HTML.
    } else {
      document.documentElement.classList.remove("dark-mode"); // Se não, remove a classe "dark-mode" da tag HTML.
    }
  }

  // Assistência de Voz (Leitura de Página)
  let utterance = null; // Cria uma variável nula que guardará o objeto de fala (a voz do navegador).
  function speakPage() {
    if (!("speechSynthesis" in window)) {
      // Se o navegador não tiver suporte para leitura de texto em voz...
      alert("Síntese de voz não suportada neste navegador."); // Exibe um alerta de erro para o usuário.
      return; // Interrompe a função aqui.
    }
    stopSpeech(); // Chama a função para parar qualquer leitura anterior antes de começar uma nova.

    // Captura apenas os textos relevantes dos artigos
    const nodes = document.querySelectorAll(
      "article h2, article h3, article p, article li", // Seleciona títulos, subtítulos, parágrafos e listas dentro de artigos.
    );
    const text = Array.from(nodes) // Transforma a lista de elementos selecionados em uma Array manipulável.
      .map((n) => n.innerText) // Extrai apenas o texto visível de dentro de cada tag selecionada.
      .join("\n"); // Une todos esses textos em uma única grande mensagem separada por quebras de linha.

    if (!text.trim()) return; // Se o texto estiver vazio (ou apenas espaços), cancela o início da leitura.

    utterance = new SpeechSynthesisUtterance(text); // Inicializa o motor de fala com o texto extraído da página.
    utterance.lang = "pt-BR"; // Define o idioma da fala para Português do Brasil.
    utterance.rate = 1.1; // Define a velocidade da leitura ligeiramente mais rápida que o padrão.
    window.speechSynthesis.speak(utterance); // Ordena que o navegador comece a falar o texto em voz alta.
  }

  function stopSpeech() {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      // Se o motor de fala existir e estiver lendo algo no momento...
      window.speechSynthesis.cancel(); // Cancela imediatamente a leitura de voz em andamento.
      utterance = null; // Limpa a variável do objeto de fala.
    }
  }

  // Criação Dinâmica da Barra de Ferramentas de Acessibilidade
  function createToolbar() {
    const toolbar = document.createElement("div"); // Cria um novo elemento <div> na memória.
    toolbar.className = "a11y-toolbar"; // Define a classe CSS desse div para "a11y-toolbar".
    toolbar.setAttribute("role", "region"); // Define o papel semântico para leitores de tela como uma região do site.
    toolbar.setAttribute("aria-label", "Controles de acessibilidade"); // Dá uma etiqueta descritiva à região para deficientes visuais.

    // Insere o código HTML interno com os botões de controle de acessibilidade
    toolbar.innerHTML = `
      <button class="a11y-btn" id="a11y-decrease" title="Diminuir fonte">A-</button>
      <button class="a11y-btn" id="a11y-reset" title="Redefinir fonte">A</button>
      <button class="a11y-btn" id="a11y-increase" title="Aumentar fonte">A+</button>
      <button class="a11y-btn" id="a11y-dark" title="Alternar modo claro/escuro">🌙</button>
      <button class="a11y-btn" id="a11y-speak" title="Ler a página">🔊</button>
      <button class="a11y-btn" id="a11y-stop" title="Parar leitura">■</button>
    `;

    document.body.appendChild(toolbar); // Coloca a barra criada no final da tag <body> para exibi-la no site.

    // Event Listeners das Ferramentas
    toolbar.querySelector("#a11y-decrease").addEventListener("click", () => {
      state.font = Math.max(80, state.font - 10); // Diminui o tamanho da fonte em 10%, não deixando ficar menor que 80%.
      storage.setItem("agrinho-font", state.font); // Grava a nova preferência de fonte no navegador.
      applyFont(); // Executa a função que aplica visualmente a alteração da fonte.
    });

    toolbar.querySelector("#a11y-increase").addEventListener("click", () => {
      state.font = Math.min(140, state.font + 10); // Aumenta o tamanho da fonte em 10%, limitando o máximo em 140%.
      storage.setItem("agrinho-font", state.font); // Grava a nova preferência de fonte no navegador.
      applyFont(); // Aplica a alteração visualmente.
    });

    toolbar.querySelector("#a11y-reset").addEventListener("click", () => {
      state.font = 100; // Redefine o valor da fonte para o padrão inicial (100%).
      storage.setItem("agrinho-font", state.font); // Salva esse reset no navegador.
      applyFont(); // Aplica a restauração na tela.
    });

    toolbar.querySelector("#a11y-dark").addEventListener("click", () => {
      state.dark = !state.dark; // Inverte o valor do modo escuro (se for true vira false, se for false vira true).
      storage.setItem("agrinho-dark", state.dark); // Salva o novo estado de cor no navegador.
      applyDark(); // Executa a função que altera as cores do site.
    });

    // Associa o clique no botão de som para ativar a função de fala da página.
    toolbar.querySelector("#a11y-speak").addEventListener("click", speakPage);
    // Associa o clique no botão de parar para interromper a voz do navegador.
    toolbar.querySelector("#a11y-stop").addEventListener("click", stopSpeech);
  }

  // Inicialização ao Carregar o DOM
  document.addEventListener("DOMContentLoaded", () => {
    // Executa as configurações assim que a estrutura da página terminar de carregar.
    const yearEl = document.getElementById("year"); // Busca por um elemento que tenha o id="year".
    if (yearEl) yearEl.textContent = new Date().getFullYear(); // Se o elemento existir, coloca o ano atual dentro dele.

    applyFont(); // Aplica o tamanho de fonte salvo na última visita do usuário.
    applyDark(); // Aplica o modo visual (claro/escuro) salvo na última visita.
    createToolbar(); // Cria na tela a barra com os botões de acessibilidade.
  });
})(); // Executa a função anônima imediatamente para isolar as variáveis do escopo global.
