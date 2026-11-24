# Léxico Diário — Palavra do Dia (PT-BR)

[>>Acesse Léxico Diário<<](https://rolim8.github.io/Lexico-Diario/Lexico-Diario.html) 
****

**Léxico Diário** é uma aplicação web que apresenta uma palavra em português do Brasil por dia. Cada entrada inclui significado, classe gramatical, sílabas, sinônimos, antônimos, etimologia e um exemplo de uso.

O projeto foi desenvolvido com HTML, CSS e JavaScript puros, sem a necessidade de frameworks ou ferramentas de compilação.

## Funcionalidades

- Palavra selecionada automaticamente para a data atual
- Contagem regressiva para a próxima palavra
- Consulta a fontes léxicas abertas:
  - Dicionário Aberto
  - Wikcionário PT-BR
- Conteúdo local de contingência quando as APIs não estão disponíveis
- Cache da palavra do dia no navegador
- Lista de palavras favoritas
- Tema claro e tema escuro
- Pronúncia da palavra por síntese de voz
- Modal com prévia e opções para compartilhar a palavra
- Interface responsiva para computadores e dispositivos móveis

## Tecnologias

- HTML5
- CSS3
- JavaScript moderno
- APIs públicas de consulta léxica
- `localStorage` para cache e favoritos
- Web Speech API para pronúncia

## Como executar

Não é necessário instalar dependências.

### Abrir diretamente no navegador

Abra o arquivo `Lexico-Diario.html` em seu navegador.

Algumas funcionalidades podem exigir que o projeto seja executado por um servidor local, especialmente as consultas às APIs externas.

### Executar com Python

Na pasta do projeto, execute:

```bash
python -m http.server 4173
```

Depois, acesse:

```text
http://localhost:4173/Lexico-Diario.html
```

### Executar com Node.js

Caso tenha o pacote `serve` instalado:

```bash
npx serve .
```

Abra a URL exibida pelo servidor no navegador.

## Estrutura do projeto

```text
Lexico Diario/
├── Lexico-Diario.html  # Estrutura da página
├── app.js              # Dados, APIs, cache e interações
├── styles.css          # Visual, temas e responsividade
└── README.md           # Documentação do projeto
```

## Funcionamento

A aplicação determina a palavra do dia com base na data atual e mantém um fallback local caso uma definição externa não esteja disponível.

As consultas são realizadas em paralelo ao Dicionário Aberto e ao Wikcionário. A aplicação usa a primeira definição válida encontrada e salva o resultado no `localStorage`.

Cada consulta externa possui timeout para evitar que o carregamento fique pendente.

## Favoritos e privacidade

As palavras favoritas e o tema escolhido ficam armazenados apenas no navegador do usuário por meio do `localStorage`.

O projeto não possui servidor próprio, banco de dados ou sistema de contas. Nenhuma informação de usuário é enviada ou armazenada pelo aplicativo.

## Fontes

- [Dicionário Aberto](https://dicionario-aberto.net/)
- [Wikcionário](https://pt.wiktionary.org/)

Os direitos e licenças das informações exibidas podem variar conforme a fonte consultada.

## Contribuindo

Contribuições são bem-vindas:

1. Faça um fork do projeto.
2. Crie uma branch para sua alteração.
3. Realize uma alteração clara e testada.
4. Abra um pull request descrevendo o motivo e o resultado da mudança.

Sugestões para melhorias incluem:

- Inclusão de novas palavras e definições locais
- Melhor tratamento de erros das APIs
- Novos testes automatizados
- Melhorias de acessibilidade
- Tradução ou internacionalização
