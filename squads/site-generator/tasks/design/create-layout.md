---
task: createLayout()
version: "1.0.0"
responsible: "@design-captain"
delegates_to:
  - "@layout-architect-lieutenant"
  - "@responsive-sergeant"
atomic_layer: Task
elicit: false
description: >
  Cria a estrutura de layout da pagina, definindo a grade (grid), hierarquia
  visual, espacamento, sequencia de secoes e organizacao espacial de todos
  os elementos. O layout deve otimizar o fluxo de leitura para maximizar
  conversao e funcionar perfeitamente em dispositivos moveis e desktops.

inputs:
  - field: awareness_mapping
    type: AwarenessMappingOutput
    source: "mapAwarenessLevel()"
    required: true
    description: "Sequencia de secoes e estrutura de pagina recomendada pelo nivel de consciencia"
  - field: headline_output
    type: HeadlineOutput
    source: "writeHeadline()"
    required: true
    description: "Headlines para dimensionamento de areas de texto"
  - field: body_copy_output
    type: BodyCopyOutput
    source: "writeBodyCopy()"
    required: true
    description: "Corpo da copy com todas as secoes para planejamento de layout"
  - field: cta_output
    type: CTAOutput
    source: "writeCTA()"
    required: true
    description: "Chamadas para acao com posicionamento definido"
  - field: faq_output
    type: FAQOutput
    source: "writeFAQ()"
    required: true
    description: "Perguntas frequentes para secao de FAQ"
  - field: section_catalog
    type: SectionCatalog
    source: "data/section-catalog.yaml"
    required: true
    description: "Catalogo de templates de secoes reutilizaveis disponiveis"
  - field: design_tokens
    type: DesignTokens
    source: "data/design-tokens.yaml"
    required: true
    description: "Tokens de design (espacamento, tipografia, breakpoints)"

outputs:
  - field: layout_output
    type: LayoutOutput
    destination: dev-captain
    schema:
      page_structure:
        - section_id: string
          section_template: string
          grid_columns: number
          content_placement: object
          spacing: object
      responsive_breakpoints:
        mobile: object
        tablet: object
        desktop: object
      visual_hierarchy:
        primary_elements: string[]
        secondary_elements: string[]
        tertiary_elements: string[]
      scroll_flow: string
      estimated_scroll_depth: string
      cta_positions: string[]

quality_gate:
  blocking:
    - "Todas as secoes do awareness_mapping possuem template de layout atribuido"
    - "Layout responsivo definido para mobile (360 pixels), tablet (768 pixels) e desktop (1440 pixels)"
    - "Hierarquia visual definida com elementos primarios, secundarios e terciarios"
    - "Chamadas para acao posicionadas em pontos de alta atencao (acima da dobra, apos beneficios, apos oferta)"
    - "Templates selecionados existem no catalogo de secoes"
  non_blocking:
    - "Espacamento consistente usando tokens de design"
    - "Fluxo de leitura otimizado para padrao F ou Z conforme tipo de conteudo"
    - "Areas de respiro visual (white space) suficientes entre secoes"
    - "Layout mobile-first como base"

execution:
  steps:
    - step: 1
      action: "Selecionar templates de secao"
      description: >
        Para cada secao definida no awareness_mapping, selecionar o template
        mais adequado do catalogo de secoes (section-catalog.yaml). Considerar
        o tipo de conteudo, quantidade de texto e elementos visuais de cada secao.
    - step: 2
      action: "Definir grade e espacamento"
      description: >
        Configurar a grade base (12 colunas para desktop, 4 para mobile),
        gutters e margens laterais usando os tokens de design. Definir
        espacamento entre secoes (padding e margin) com ritmo visual consistente.
    - step: 3
      action: "Estabelecer hierarquia visual"
      description: >
        Classificar todos os elementos em primarios (headlines, chamadas para
        acao), secundarios (corpo de texto, imagens) e terciarios (badges,
        micro-copy, rodape). Atribuir pesos visuais correspondentes.
    - step: 4
      action: "Posicionar chamadas para acao"
      description: >
        Garantir que a chamada para acao principal apareca acima da dobra
        (nos primeiros 600 pixels verticais em desktop). Posicionar chamadas
        secundarias apos cada ponto de pico emocional no fluxo da copy.
    - step: 5
      action: "Adaptar para responsividade"
      description: >
        Criar variacoes de layout para cada breakpoint, reorganizando
        elementos para manter a hierarquia visual e usabilidade em telas
        menores. Priorizar conteudo critico em mobile.

error_handling:
  - condition: "Template de secao nao encontrado no catalogo"
    action: "Usar template generico de secao (generic-section) e adaptar com CSS customizado"
  - condition: "Conteudo de secao excede o espaco planejado"
    action: "Expandir a secao verticalmente ou dividir em subsecoes, nunca comprimir texto"
---

# Tarefa: Criar Layout da Pagina

## Contexto

O layout e a arquitetura visual da pagina — determina como o conteudo sera consumido
pelo visitante. Um layout bem projetado guia o olhar do visitante naturalmente pela
sequencia de persuasao, tornando a leitura fluida e a conversao intuitiva.

## Responsavel

**@design-captain** com delegacao para **@layout-architect-lieutenant** e **@responsive-sergeant**

## Principios de Layout para Conversao

1. Chamada para acao acima da dobra (primeiros 600 pixels em desktop)
2. Uma unica coluna para o fluxo principal de argumentacao
3. Contraste visual nos pontos de conversao
4. Espacamento generoso para facilitar leitura em mobile
5. Sequencia de secoes segue o framework de copy selecionado
