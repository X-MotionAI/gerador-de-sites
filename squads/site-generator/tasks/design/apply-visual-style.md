---
task: applyVisualStyle()
version: "1.0.0"
responsible: "@design-captain"
delegates_to:
  - "@visual-style-lieutenant"
  - "@color-typography-sergeant"
atomic_layer: Task
elicit: false
description: >
  Aplica o estilo visual completo da pagina — paleta de cores, tipografia,
  iconografia, sombras, bordas, gradientes e efeitos visuais — baseado nas
  cores da marca do briefing, no tom de comunicacao e nas melhores praticas
  de design para conversao.

inputs:
  - field: briefing_output
    type: BriefingOutput
    source: "@site-commander"
    required: true
    description: "Briefing com cores da marca, tom de comunicacao e logo"
  - field: layout_output
    type: LayoutOutput
    source: "createLayout()"
    required: true
    description: "Layout completo com hierarquia visual definida"
  - field: design_tokens
    type: DesignTokens
    source: "data/design-tokens.yaml"
    required: true
    description: "Tokens base de design (tipografia, espacamento, cores base)"

outputs:
  - field: visual_style_output
    type: VisualStyleOutput
    destination: dev-captain
    schema:
      color_palette:
        primary: string
        secondary: string
        accent: string
        background: string
        surface: string
        text_primary: string
        text_secondary: string
        text_on_primary: string
        success: string
        warning: string
        error: string
      typography:
        font_family_heading: string
        font_family_body: string
        scale: object
        line_heights: object
        letter_spacing: object
      effects:
        border_radius: string
        shadow_levels: object
        gradients: string[]
        hover_effects: object
      button_styles:
        primary: object
        secondary: object
        ghost: object
      section_backgrounds:
        - section_id: string
          background_type: string
          background_value: string
      css_custom_properties: string

quality_gate:
  blocking:
    - "Paleta de cores completa com todas as variaveis definidas"
    - "Contraste de texto sobre fundo atende WCAG 2.1 nivel AA (minimo 4.5:1 para texto normal)"
    - "Tipografia definida com familia, escala e alturas de linha"
    - "Estilos de botao definidos para estados normal, hover, foco e desabilitado"
    - "Botao de chamada para acao principal e o elemento de maior destaque visual da pagina"
  non_blocking:
    - "Cores da marca do briefing incorporadas na paleta"
    - "Gradientes e efeitos de sombra consistentes"
    - "Backgrounds alternados entre secoes para ritmo visual"
    - "Hover effects definidos para todos os elementos interativos"
    - "CSS custom properties (variaveis CSS) geradas para reutilizacao"

execution:
  steps:
    - step: 1
      action: "Definir paleta de cores"
      description: >
        Se cores da marca foram fornecidas no briefing, usa-las como base
        e expandir para uma paleta completa com variacoes de luminosidade.
        Se nao fornecidas, gerar uma paleta otimizada para conversao baseada
        no nicho, tipo de produto e tom de comunicacao.
    - step: 2
      action: "Verificar acessibilidade de contraste"
      description: >
        Calcular razao de contraste entre todas as combinacoes de texto/fundo.
        Ajustar cores que nao atendam o minimo de 4.5:1 (WCAG 2.1 nivel AA).
        Botoes de chamada para acao devem ter contraste minimo de 7:1.
    - step: 3
      action: "Selecionar e configurar tipografia"
      description: >
        Escolher fontes complementares para headings e corpo de texto.
        Fontes devem estar disponiveis no Google Fonts para carregamento
        rapido. Definir escala tipografica completa (h1 a h6, body, small,
        caption) com alturas de linha e espacamento entre letras.
    - step: 4
      action: "Definir estilos de componentes"
      description: >
        Criar estilos para botoes (primario, secundario, fantasma),
        cards, badges, formularios, secoes e todos os componentes visuais
        usados no layout. Definir estados de interacao (hover, foco, ativo).
    - step: 5
      action: "Gerar variaveis CSS"
      description: >
        Compilar todas as decisoes de estilo em variaveis CSS (custom properties)
        para uso no HTML gerado. Organizar por categoria (cores, tipografia,
        espacamento, efeitos) para facil manutencao.

error_handling:
  - condition: "Cores da marca tem contraste insuficiente"
    action: "Ajustar luminosidade das cores mantendo o matiz (hue) original da marca, e informar o usuario sobre o ajuste"
  - condition: "Fonte solicitada nao esta disponivel no Google Fonts"
    action: "Selecionar a fonte mais proxima disponivel no Google Fonts e informar a substituicao"
  - condition: "Tom 'urgente' solicitado mas cores da marca sao pasteis"
    action: "Criar cor de acento de alta saturacao para chamadas para acao, mantendo cores da marca para o restante da pagina"
---

# Tarefa: Aplicar Estilo Visual

## Contexto

O estilo visual transforma a estrutura de layout em uma experiencia visual coesa
e profissional. Cores, tipografia e efeitos visuais nao sao decoracao — sao
ferramentas de persuasao que afetam diretamente a percepcao de credibilidade,
urgencia e valor do produto.

## Responsavel

**@design-captain** com delegacao para **@visual-style-lieutenant** e **@color-typography-sergeant**

## Principios de Design para Conversao

1. Uma cor de acento dominante para todos os elementos de conversao (botoes de chamada para acao)
2. Contraste maximo no botao principal — deve ser impossivel de ignorar
3. Tipografia leivel em mobile (minimo 16 pixels para corpo de texto)
4. Fundos alternados entre secoes criam ritmo visual e facilitam escaneamento
5. Menos e mais — cada efeito visual deve ter um proposito funcional
