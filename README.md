# Léxico Diário — Palavra do Dia (PT-BR)

Aplicação web editorial e responsiva para descoberta diária de vocabulário em **Português do Brasil**, projetada para entregar **uma única palavra nova por dia** com base na data do sistema.

## ✨ Funcionalidades

- **Seleção Determinística Diária (1 palavra por dia):** Utiliza a data local (`YYYY-MM-DD`) como chave determinística para selecionar o verbete do dia, garantindo consistência durante as 24 horas e transição automática à meia-noite.
- **Ficha Lexical Completa:** Apresenta divisão silábica, classe gramatical, definição clara, sinônimos, antônimos, origem/etimologia e frase de exemplo em contexto.
- **Pronúncia em Áudio (`pt-BR`):** Lê a palavra em voz alta utilizando a API nativa de síntese de voz do navegador (`speechSynthesis`) com fallback amigável caso o recurso não esteja disponível.
- **Arquivo dos Últimos 14 Dias:** Permite consultar os verbetes anteriores de forma cronológica e retornar rapidamente à palavra do dia atual.
- **Favoritos com Persistência Local:** Salva palavras marcadas pelo usuário no `localStorage` para consulta posterior.
- **Cartão Visual Compartilhável:** Gera uma visualização em formato de cartão com a palavra, classe, definição e exemplo, permitindo copiar o texto formatado ou exportar/compartilhar.
- **Tema Claro e Escuro:** Alternância entre modo claro editorial e modo escuro confortável para leitura, com preferência salva no navegador.

## 🛠️ Tecnologias Utilizadas

- **HTML5 Semântico**
- **CSS3** (variáveis customizadas, layout responsivo, temas claro/escuro)
- **JavaScript (ES6+)** (lógica determinística por data, manipulação do DOM, `Web Speech API`, `localStorage`)

## 📁 Estrutura do Projeto

```text
.
├── index.html          # Estrutura principal da aplicação e interface editorial
├── styles.css          # Estilos, temas claro/escuro, tipografia e layout responsivo
├── app.js              # Seleção diária por data, acervo lexical, áudio, favoritos e cartão
└── README.md           # Documentação do projeto
```

(Nota: se o projeto estiver consolidado em um único arquivo .html, os blocos de estilo e script encontram-se integrados no mesmo documento.)
🚀 Como Executar

- Baixe ou clone os arquivos do projeto para uma pasta local.

- Abra o arquivo index.html (ou o arquivo .html gerado) diretamente em qualquer navegador moderno (Chrome, Edge, Firefox, Safari).

- Não é necessário servidor backend, instalação de dependências ou chave de API.

🧠 Como Funciona a Regra de "Uma Palavra por Dia"

A seleção da palavra é vinculada ao dia civil (ano-mês-dia) do dispositivo do usuário:

- Enquanto o dia for o mesmo, recarregar a página mantém a mesma palavra.

- Ao mudar o dia (00:00), o índice calculado avança para o próximo verbete do acervo.

📌 Possíveis Melhorias Futuras

- Expandir o acervo lexical com centenas de novos verbetes catalogados.

- Adicionar filtro por classe gramatical ou nível de raridade dentro do histórico/favoritos.

- Exportar o cartão diário diretamente como imagem .png via <canvas>.
