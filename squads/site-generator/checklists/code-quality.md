---
checklist:
  id: code-quality
  name: "Checklist de Qualidade de Codigo"
  version: "1.0"
  used_by:
    - code-reviewer
    - qa-captain
  severity_levels:
    critical: "Bloqueia entrega — deve ser corrigido antes da publicacao"
    non_critical: "Recomendacao de melhoria — nao bloqueia entrega mas deve ser documentado"
---

# Checklist de Qualidade de Codigo

## Itens Criticos (Bloqueiam Entrega)

### TypeScript e Compilacao
- [ ] **Compilacao sem erros**: O codigo compila com zero erros em modo strict do TypeScript (strict: true)
- [ ] **Zero uso de any**: Nenhuma variavel, parametro ou retorno utiliza o tipo `any` (explicito ou implicito)
- [ ] **Verificacao de nulos**: Todas as propriedades opcionais e retornos possivelmente nulos possuem verificacao antes do acesso (strictNullChecks)
- [ ] **Tipos definidos**: Todas as interfaces, tipos e estruturas de dados possuem definicao de tipos explicita
- [ ] **Zero variaveis ou parametros nao utilizados**: Nenhuma variavel ou parametro declarado sem uso (noUnusedLocals, noUnusedParameters)

### HTML Valido e Semantico
- [ ] **DOCTYPE presente**: O documento inicia com `<!DOCTYPE html>`
- [ ] **Atributo lang definido**: O elemento `<html>` possui atributo `lang` com o idioma correto da pagina (exemplo: `lang="pt-BR"`)
- [ ] **Meta charset definido**: `<meta charset="utf-8">` presente no `<head>`
- [ ] **Meta viewport definido**: `<meta name="viewport" content="width=device-width, initial-scale=1">` presente no `<head>`
- [ ] **Titulo da pagina definido**: `<title>` presente no `<head>` com texto descritivo e unico
- [ ] **Exatamente um H1**: A pagina possui exatamente 1 elemento `<h1>`
- [ ] **Hierarquia de headings correta**: Headings seguem ordem hierarquica sem pular niveis (H1 seguido de H2, H2 seguido de H3)
- [ ] **Elemento main unico**: Exatamente 1 elemento `<main>` presente na pagina
- [ ] **IDs unicos**: Todos os atributos `id` na pagina sao unicos (sem duplicatas)
- [ ] **Tags fechadas**: Todas as tags abertas possuem tags de fechamento correspondentes
- [ ] **Validacao do World Wide Web Consortium**: Zero erros de validacao HTML segundo o validador do World Wide Web Consortium

### Acessibilidade (Web Content Accessibility Guidelines 2.1 nivel AA)
- [ ] **Atributos alt em imagens**: Todas as imagens possuem atributo `alt` descritivo (ou `alt=""` para imagens puramente decorativas)
- [ ] **Labels em formularios**: Todos os campos de formulario possuem `<label>` associado via atributo `for` ou aninhamento
- [ ] **Campos obrigatorios marcados**: Campos obrigatorios possuem atributo `aria-required="true"` e indicacao visual
- [ ] **Roles de landmark**: Regioes da pagina possuem roles ARIA adequados (`banner`, `navigation`, `main`, `contentinfo`)
- [ ] **Botoes com texto acessivel**: Todos os botoes possuem texto acessivel (texto visivel, `aria-label` ou `aria-labelledby`)
- [ ] **Links com texto descritivo**: Nenhum link com texto generico sem contexto acessivel ("clique aqui", "saiba mais" sem `aria-label`)
- [ ] **Skip link presente**: Link "Pular para conteudo principal" presente como primeiro elemento focavel da pagina
- [ ] **Regioes dinamicas anunciadas**: Areas com conteudo que atualiza dinamicamente possuem `aria-live` apropriado
- [ ] **Formularios com mensagens de erro acessiveis**: Erros de validacao de formulario sao anunciados para leitores de tela via `aria-describedby` ou `aria-live`

### Navegacao por Teclado
- [ ] **Todos os interativos focaveis**: Todos os elementos interativos (botoes, links, campos, checkboxes, selects) sao alcancaveis via Tab
- [ ] **Ordem de tabulacao logica**: A ordem de tabulacao segue a ordem visual da pagina (esquerda para direita, cima para baixo)
- [ ] **Indicador de foco visivel**: Todos os elementos focaveis possuem indicador de foco visivel e com contraste adequado
- [ ] **Sem armadilha de teclado**: Nenhum elemento impede que o usuario continue navegando via Tab (keyboard trap)
- [ ] **Modais acessiveis por teclado**: Modais capturam o foco, permitem navegacao interna por Tab e fecham com Escape
- [ ] **Enter e Espaco funcionais**: Enter ativa links e botoes, Espaco ativa botoes e checkboxes

### Erros e Funcionalidade
- [ ] **Zero erros de console no carregamento**: Nenhum erro JavaScript, de recurso (404) ou de seguranca (mixed content) no carregamento da pagina
- [ ] **Zero erros de console na interacao**: Nenhum erro JavaScript ao interagir com botoes, formularios, menus e outros elementos interativos
- [ ] **Formularios funcionais**: Todos os formularios enviam dados corretamente para o destino configurado
- [ ] **Links funcionais**: Todos os links apontam para destinos validos e funcionais (zero links quebrados)
- [ ] **Chamadas para acao funcionais**: Todos os botoes de chamada para acao executam a acao esperada (redirecionamento, abertura de modal, envio de formulario, abertura de WhatsApp)

### Performance (Google Lighthouse)
- [ ] **Performance minimo 90**: Pontuacao de performance do Google Lighthouse igual ou superior a 90 em modo mobile
- [ ] **Acessibilidade minimo 90**: Pontuacao de acessibilidade do Google Lighthouse igual ou superior a 90
- [ ] **Melhores praticas minimo 90**: Pontuacao de melhores praticas do Google Lighthouse igual ou superior a 90
- [ ] **Otimizacao para motores de busca minimo 90**: Pontuacao de otimizacao para motores de busca do Google Lighthouse igual ou superior a 90
- [ ] **Largest Contentful Paint inferior a 2.5 segundos**: O maior elemento de conteudo renderiza em menos de 2.5 segundos
- [ ] **Cumulative Layout Shift inferior a 0.1**: A estabilidade visual da pagina durante carregamento e inferior a 0.1

## Itens Nao Criticos (Recomendacoes)

### Otimizacao de Performance
- [ ] **Imagens em formato moderno**: Imagens servidas em formato WebP ou AVIF com fallback para formatos tradicionais
- [ ] **Imagens com dimensoes corretas**: Imagens possuem atributos `width` e `height` para prevenir layout shift
- [ ] **Carregamento preguicoso de imagens**: Imagens abaixo da dobra possuem atributo `loading="lazy"`
- [ ] **Fontes com font-display swap**: Fontes customizadas carregam com `font-display: swap` para prevenir texto invisivel
- [ ] **CSS critico inlinhado**: CSS necessario para renderizar o conteudo acima da dobra esta inlinhado no `<head>`
- [ ] **JavaScript nao bloqueante**: Scripts nao essenciais possuem atributo `defer` ou `async`
- [ ] **Preconnect para origens externas**: `<link rel="preconnect">` configurado para origens de fontes e servicos externos
- [ ] **First Contentful Paint inferior a 1.8 segundos**: O primeiro conteudo significativo renderiza em menos de 1.8 segundos
- [ ] **Total Blocking Time inferior a 200 milissegundos**: O tempo total de bloqueio da thread principal e inferior a 200 milissegundos

### HTML Semantico
- [ ] **Elementos semanticos de estrutura**: Uso de `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>` em vez de `<div>` generico
- [ ] **Botoes como button**: Elementos que executam acoes usam `<button>`, nao `<div>` ou `<a>` com handler de clique
- [ ] **Links como anchor**: Elementos de navegacao usam `<a>` com `href`, nao `<span>` ou `<div>` com handler de clique
- [ ] **Listas semanticas**: Conteudo em lista usa `<ul>`, `<ol>` ou `<dl>`, nao `<div>` com bullets visuais
- [ ] **Tabelas semanticas**: Dados tabulares usam `<table>` com `<thead>`, `<tbody>`, `<th>` com atributo `scope`
- [ ] **Formularios com form**: Campos de entrada estao dentro de `<form>` com `action` definido

### Qualidade de Codigo
- [ ] **Sem codigo comentado**: Nenhum bloco de codigo comentado ("dead code") permanece no codigo fonte
- [ ] **Sem console.log**: Nenhuma instrucao `console.log` de depuracao permanece no codigo de producao
- [ ] **Nomenclatura consistente**: Variaveis, funcoes e componentes seguem convencao de nomenclatura consistente (camelCase para variaveis, PascalCase para componentes)
- [ ] **Funcoes pequenas**: Funcoes possuem responsabilidade unica e tamanho gerenciavel (recomendado menos de 50 linhas)
- [ ] **Tratamento de erros**: Operacoes asincronas possuem tratamento de erro (try/catch ou .catch())
- [ ] **Imports organizados**: Imports estao organizados em grupos logicos (externos, internos, tipos) e sem imports nao utilizados
