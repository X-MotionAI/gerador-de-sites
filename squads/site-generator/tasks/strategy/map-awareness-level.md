---
task: mapAwarenessLevel()
version: "1.0.0"
responsible: "@strategy-captain"
delegates_to:
  - "@audience-analyst-lieutenant"
atomic_layer: Task
elicit: false
description: >
  Mapeia o nivel de consciencia do publico-alvo segundo a escala de Eugene
  Schwartz (5 niveis) e determina a estrutura de pagina, abordagem de headline,
  framework de copy, estilo de chamada para acao e comprimento de argumentacao
  correspondentes.

inputs:
  - field: briefing_output
    type: BriefingOutput
    source: "@site-commander"
    required: true
    description: "Briefing com informacoes do publico-alvo e nivel de consciencia"
  - field: awareness_levels_config
    type: AwarenessLevelsConfig
    source: "data/awareness-levels.yaml"
    required: true
    description: "Matriz completa de niveis de consciencia com configuracoes de cada nivel"

outputs:
  - field: awareness_mapping_output
    type: AwarenessMappingOutput
    destination: strategy-captain
    schema:
      detected_level: string
      confidence: number
      detection_reasoning: string
      page_structure:
        sections_sequence: string[]
        estimated_word_count: number
        scroll_depth: string
      headline_approach: string
      copy_framework: string
      cta_style: string
      proof_elements_priority: string[]
      emotional_temperature: string
      rational_vs_emotional_ratio: string

quality_gate:
  blocking:
    - "Nivel de consciencia identificado e valido (um dos 5 niveis de Schwartz)"
    - "Confianca da deteccao acima de 70%"
    - "Sequencia de secoes da pagina definida com no minimo 5 secoes"
    - "Abordagem de headline definida e alinhada com o nivel detectado"
  non_blocking:
    - "Raciocinio da deteccao documentado"
    - "Contagem estimada de palavras definida"
    - "Proporcao entre argumentos racionais e emocionais definida"

execution:
  steps:
    - step: 1
      action: "Avaliar sinais de consciencia"
      description: >
        Analisar os dados do briefing para identificar sinais que indicam
        o nivel de consciencia do publico-alvo: origem do trafego, tipo de
        produto, preco, familiaridade do publico com o problema e a solucao.
    - step: 2
      action: "Classificar nivel de consciencia"
      description: >
        Mapear os sinais identificados para um dos 5 niveis de Schwartz:
        Completamente Inconsciente, Consciente do Problema, Consciente da
        Solucao, Consciente do Produto, Totalmente Consciente.
    - step: 3
      action: "Aplicar configuracao do nivel"
      description: >
        Carregar a configuracao correspondente do awareness-levels.yaml,
        incluindo secoes recomendadas, abordagem de headline, framework
        de copy, estilo de chamada para acao e comprimento de argumentacao.
    - step: 4
      action: "Ajustar para contexto especifico"
      description: >
        Personalizar a configuracao padrao do nivel baseado nas
        particularidades do produto, publico e mercado informados no briefing.
        Permitir combinacoes hibridas quando o publico estiver entre dois niveis.

error_handling:
  - condition: "Nivel de consciencia marcado como 'auto' no briefing"
    action: "Executar deteccao completa usando os sinais do briefing e atribuir confianca ao resultado"
  - condition: "Sinais ambiguos apontando para 2 niveis diferentes"
    action: "Selecionar o nivel mais baixo (menos consciente) como padrao conservador, pois uma pagina para publico menos consciente funciona para mais conscientes, mas nao o inverso"
---

# Tarefa: Mapear Nivel de Consciencia

## Contexto

O nivel de consciencia do publico-alvo e o fator numero um que determina a estrutura
inteira da pagina. Um publico "Completamente Inconsciente" precisa de uma pagina
completamente diferente de um publico "Totalmente Consciente". Esta classificacao
afeta TUDO: headline, comprimento, framework de copy, tipo de prova social,
intensidade da chamada para acao e ate o design visual.

## Responsavel

**@strategy-captain** com delegacao para **@audience-analyst-lieutenant**

## Referencia Teorica

Baseado nos 5 niveis de consciencia de Eugene Schwartz definidos em
"Breakthrough Advertising" (1966), adaptados para o contexto de paginas digitais.
Configuracao completa em `data/awareness-levels.yaml`.
