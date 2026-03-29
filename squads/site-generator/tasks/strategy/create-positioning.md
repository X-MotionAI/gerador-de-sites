---
task: createPositioning()
version: "1.0.0"
responsible: "@strategy-captain"
delegates_to:
  - "@positioning-lieutenant"
atomic_layer: Task
elicit: false
description: >
  Cria o posicionamento estrategico do produto no mercado, definindo a proposta
  unica de valor, o angulo de ataque da copy, o territorio de marca e a
  narrativa central que permeara toda a pagina.

inputs:
  - field: briefing_output
    type: BriefingOutput
    source: "@site-commander"
    required: true
    description: "Briefing completo coletado na fase anterior"
  - field: awareness_level_data
    type: AwarenessLevelConfig
    source: "data/awareness-levels.yaml"
    required: true
    description: "Configuracao do nivel de consciencia detectado ou selecionado"
  - field: copywriting_frameworks
    type: CopywritingFrameworks
    source: "data/copywriting-frameworks.yaml"
    required: true
    description: "Frameworks de copywriting disponiveis para selecao"

outputs:
  - field: positioning_output
    type: PositioningOutput
    destination: copy-captain
    schema:
      unique_value_proposition: string
      primary_angle: string
      secondary_angles: string[]
      brand_territory: string
      central_narrative: string
      enemy_narrative: string
      transformation_promise: string
      proof_strategy: string
      selected_framework: string
      headline_direction: string
      emotional_triggers: string[]
      rational_arguments: string[]
      objection_map: object

quality_gate:
  blocking:
    - "Proposta unica de valor definida com no minimo 30 caracteres"
    - "Angulo primario de ataque definido e alinhado com o nivel de consciencia"
    - "Framework de copywriting selecionado e justificado"
    - "Promessa de transformacao clara e especifica"
  non_blocking:
    - "Angulos secundarios identificados (minimo 2 recomendado)"
    - "Mapa de objecoes com pelo menos 3 objecoes mapeadas"
    - "Gatilhos emocionais listados (minimo 3 recomendado)"

execution:
  steps:
    - step: 1
      action: "Analisar cenario competitivo"
      description: >
        Avaliar os concorrentes mencionados no briefing, identificar lacunas
        no mercado e oportunidades de diferenciacao. Se concorrentes nao foram
        informados, inferir cenario competitivo generico do nicho.
    - step: 2
      action: "Definir proposta unica de valor"
      description: >
        Formular a proposta unica de valor combinando o mecanismo unico
        do produto, a transformacao prometida e o diferencial competitivo.
        Deve ser comunicavel em uma unica frase.
    - step: 3
      action: "Selecionar framework de copywriting"
      description: >
        Baseado no nivel de consciencia do publico, tipo de pagina e
        natureza do produto, selecionar o framework de copywriting mais
        adequado (AIDA, PAS, BAB, PASTOR, 4Ps, Star-Story-Solution, etc).
    - step: 4
      action: "Construir narrativa central"
      description: >
        Criar a historia macro que conecta o problema do publico ao
        produto como solucao inevitavel. Incluir narrativa do inimigo
        (o que esta impedindo o sucesso do prospect).
    - step: 5
      action: "Mapear objecoes e contra-argumentos"
      description: >
        Listar as principais objecoes que o publico-alvo tera e preparar
        contra-argumentos para cada uma. Estas serao distribuidas ao longo
        da pagina em secoes estrategicas.

error_handling:
  - condition: "Mecanismo unico nao fornecido no briefing"
    action: "Criar um mecanismo unico inferido baseado na descricao do produto e no cenario competitivo"
  - condition: "Nivel de consciencia definido como 'auto'"
    action: "Determinar o nivel de consciencia baseado nos dados do briefing e aplicar as regras do awareness-levels.yaml"
---

# Tarefa: Criar Posicionamento Estrategico

## Contexto

O posicionamento estrategico e o alicerce de toda a comunicacao da pagina. Define
como o produto sera percebido pelo publico-alvo em relacao as alternativas existentes
e qual narrativa sera usada para persuadir o visitante.

## Responsavel

**@strategy-captain** com delegacao para **@positioning-lieutenant**

## Entradas Necessarias

- BriefingOutput completo da fase anterior
- Dados de niveis de consciencia (awareness-levels.yaml)
- Frameworks de copywriting disponiveis (copywriting-frameworks.yaml)

## Saida Esperada

PositioningOutput contendo proposta unica de valor, angulo de ataque, framework
selecionado, narrativa central e mapa de objecoes.
