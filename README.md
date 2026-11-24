# Léxico Diário — Palavra do Dia (PT-BR)

[>>Acesse Léxico Diário<<](https://rolim8.github.io/Lexico-Diario/Lexico-Diario.html) 
****

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
