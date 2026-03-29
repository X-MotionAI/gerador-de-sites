---
checklist:
  id: seo-checklist
  name: "Checklist de Otimizacao para Motores de Busca"
  version: "1.0"
  used_by:
    - code-reviewer
    - qa-captain
    - analytics-captain
  severity_levels:
    critical: "Bloqueia entrega — deve ser corrigido antes da publicacao"
    non_critical: "Recomendacao de melhoria — nao bloqueia entrega mas deve ser documentado"
---

# Checklist de Otimizacao para Motores de Busca

## Itens Criticos (Bloqueiam Entrega)

### Meta Tags Essenciais
- [ ] **Titulo da pagina (title tag)**: Tag `<title>` presente com texto descritivo, unico e com comprimento entre 50 e 60 caracteres incluindo a palavra-chave primaria
- [ ] **Meta descricao (meta description)**: Tag `<meta name="description">` presente com texto persuasivo entre 150 e 160 caracteres incluindo a palavra-chave primaria e chamada para acao
- [ ] **Meta viewport**: Tag `<meta name="viewport" content="width=device-width, initial-scale=1">` presente para garantir renderizacao correta em dispositivos moveis
- [ ] **Meta charset**: Tag `<meta charset="utf-8">` presente para codificacao correta de caracteres
- [ ] **Idioma definido**: Atributo `lang` no elemento `<html>` com codigo correto do idioma (exemplo: `lang="pt-BR"`)

### Estrutura de Headings
- [ ] **Exatamente um H1**: A pagina possui exatamente 1 elemento `<h1>` contendo a palavra-chave primaria
- [ ] **H1 descritivo e unico**: O texto do H1 descreve claramente o conteudo principal da pagina e nao e duplicado de outras paginas do site
- [ ] **Hierarquia correta**: Os headings seguem hierarquia logica sem pular niveis (H1, H2, H3) refletindo a estrutura do conteudo
- [ ] **Headings com valor semantico**: Os headings comunicam a estrutura do conteudo, nao sao usados apenas para estilo visual

### URLs e Navegacao
- [ ] **URL amigavel**: A URL da pagina e descritiva, usa hifens como separador, contem a palavra-chave primaria e nao contem parametros desnecessarios ou caracteres especiais
- [ ] **URL canonica definida**: Tag `<link rel="canonical">` presente apontando para a URL preferida da pagina para evitar duplicacao de conteudo
- [ ] **Links internos funcionais**: Todos os links internos apontam para paginas existentes e retornam codigo de status 200

### Indexacao e Rastreamento
- [ ] **Pagina rastreavel**: A pagina nao esta bloqueada pelo arquivo robots.txt nem possui tag `<meta name="robots" content="noindex">` inadvertidamente
- [ ] **Conteudo renderizavel**: O conteudo principal da pagina esta presente no HTML inicial (server-side rendering) e nao depende exclusivamente de JavaScript para ser exibido
- [ ] **Sem conteudo duplicado**: O conteudo textual principal da pagina e unico e nao e copiado de outras paginas do mesmo site ou de sites externos

### Mobile e Performance
- [ ] **Pagina mobile-friendly**: A pagina passa no teste de compatibilidade movel do Google (texto legivel sem zoom, conteudo ajustado a tela, elementos tocaveis com espacamento adequado)
- [ ] **Velocidade de carregamento adequada**: A pagina atinge pontuacao do Google Lighthouse para performance igual ou superior a 90 em modo mobile
- [ ] **Largest Contentful Paint inferior a 2.5 segundos**: O maior elemento de conteudo renderiza em menos de 2.5 segundos
- [ ] **Cumulative Layout Shift inferior a 0.1**: A estabilidade visual da pagina durante carregamento e inferior a 0.1

## Itens Nao Criticos (Recomendacoes)

### Conteudo e Palavras-Chave
- [ ] **Palavra-chave no H1**: A palavra-chave primaria aparece naturalmente no titulo H1 da pagina
- [ ] **Palavra-chave no primeiro paragrafo**: A palavra-chave primaria aparece naturalmente nos primeiros 150 caracteres do conteudo visivel
- [ ] **Palavras-chave secundarias nos H2**: Palavras-chave secundarias e variacoes semanticas aparecem naturalmente nos subtitulos H2
- [ ] **Densidade de palavra-chave natural**: A palavra-chave primaria aparece entre 2 e 5 vezes no conteudo sem soar forcada ou artificial
- [ ] **Conteudo com comprimento adequado**: O conteudo textual da pagina possui comprimento suficiente para cobrir o topico com profundidade (minimo recomendado de 300 palavras para paginas de conversao, 800 palavras para paginas informativas)
- [ ] **Conteudo original e valioso**: O texto oferece informacao util, perspectiva original ou solucao para o problema do usuario

### Imagens e Midia
- [ ] **Atributos alt descritivos**: Todas as imagens de conteudo possuem atributo `alt` descritivo que inclui a palavra-chave quando relevante e natural
- [ ] **Nomes de arquivo descritivos**: Arquivos de imagem possuem nomes descritivos com hifens (exemplo: `beneficios-do-produto.webp` em vez de `IMG_4523.jpg`)
- [ ] **Imagens otimizadas para web**: Imagens estao comprimidas e em formato moderno (WebP ou AVIF) para carregamento rapido
- [ ] **Dimensoes de imagem definidas**: Atributos `width` e `height` presentes nas imagens para prevenir layout shift durante carregamento
- [ ] **Carregamento preguicoso**: Imagens abaixo da dobra possuem atributo `loading="lazy"` para melhorar performance inicial

### Dados Estruturados (Schema.org)
- [ ] **Schema de organizacao**: Dados estruturados do tipo Organization presentes com nome, logotipo, endereco e informacoes de contato
- [ ] **Schema de pagina web**: Dados estruturados do tipo WebPage presentes com nome, descricao e URL
- [ ] **Schema de FAQ**: Se a pagina possui secao de perguntas frequentes, dados estruturados do tipo FAQPage estao implementados para exibicao de rich snippets nos resultados de busca
- [ ] **Schema de produto ou servico**: Se a pagina oferece produto ou servico, dados estruturados do tipo Product ou Service estao implementados com nome, descricao, preco e avaliacoes
- [ ] **Schema de avaliacao**: Se a pagina exibe avaliacoes ou depoimentos, dados estruturados do tipo Review ou AggregateRating estao implementados
- [ ] **Validacao de dados estruturados**: Todos os dados estruturados passam na validacao do Rich Results Test do Google sem erros

### Open Graph e Compartilhamento Social
- [ ] **Open Graph titulo**: Tag `<meta property="og:title">` presente com titulo otimizado para compartilhamento em redes sociais
- [ ] **Open Graph descricao**: Tag `<meta property="og:description">` presente com descricao persuasiva
- [ ] **Open Graph imagem**: Tag `<meta property="og:image">` presente com imagem de alta qualidade em dimensoes recomendadas (1200 por 630 pixels)
- [ ] **Open Graph tipo**: Tag `<meta property="og:type">` presente com valor adequado (website, article, product)
- [ ] **Open Graph URL**: Tag `<meta property="og:url">` presente com URL canonica da pagina
- [ ] **Twitter Card**: Tags de Twitter Card presentes (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) para exibicao otimizada no Twitter e X

### Links e Navegacao
- [ ] **Links com texto ancora descritivo**: Links utilizam texto ancora descritivo que comunica o destino ("Leia o estudo de caso completo" em vez de "Clique aqui")
- [ ] **Links externos com noopener**: Links para sites externos possuem atributos `rel="noopener noreferrer"` por seguranca
- [ ] **Links externos com target blank**: Links para sites externos abrem em nova aba (`target="_blank"`) para nao afastar o usuario da pagina
- [ ] **Breadcrumbs implementados**: Se a pagina faz parte de uma hierarquia de site, navegacao breadcrumb esta presente com dados estruturados BreadcrumbList
- [ ] **Sitemap XML atualizado**: O sitemap XML do site inclui a URL da pagina com data de ultima modificacao

### Performance Avancada de Otimizacao para Motores de Busca
- [ ] **HTTPS ativo**: A pagina e servida exclusivamente via protocolo HTTPS com certificado SSL valido
- [ ] **Sem redirecionamentos em cadeia**: O acesso a pagina nao envolve mais de 1 redirecionamento
- [ ] **Tempo de resposta do servidor inferior a 200 milissegundos**: O servidor responde em menos de 200 milissegundos (Time to First Byte)
- [ ] **Fontes carregadas eficientemente**: Fontes customizadas utilizam `font-display: swap` e estao hospedadas localmente ou com preconnect configurado
- [ ] **CSS e JavaScript minificados**: Arquivos CSS e JavaScript estao minificados para reducao de tamanho de transferencia
- [ ] **Compressao habilitada**: Compressao gzip ou brotli esta habilitada no servidor para todos os recursos textuais

### Otimizacao Local (quando aplicavel)
- [ ] **Nome, endereco e telefone consistentes**: Se o negocio tem presenca fisica, nome, endereco e telefone (NAP - Name, Address, Phone) sao consistentes com o perfil do Google Meu Negocio
- [ ] **Schema de negocio local**: Dados estruturados do tipo LocalBusiness presentes com horario de funcionamento, area de atendimento e informacoes de contato
- [ ] **Pagina de contato com mapa**: Se aplicavel, pagina de contato inclui mapa incorporado com localizacao do negocio
