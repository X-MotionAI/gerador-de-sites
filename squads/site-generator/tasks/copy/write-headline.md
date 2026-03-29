---
task: writeHeadline()
version: "1.0.0"
responsible: "@copy-captain"
delegates_to:
  - "@headline-specialist-lieutenant"
atomic_layer: Task
elicit: false
description: >
  Cria a headline principal e sub-headlines da pagina, aplicando o framework
  de copywriting selecionado na fase de estrategia e alinhando com o nivel
  de consciencia do publico-alvo. A headline e o elemento mais critico da
  pagina — determina se o visitante continua lendo ou abandona.

inputs:
  - field: briefing_output
    type: BriefingOutput
    source: "@site-commander"
    required: true
    description: "Briefing completo com dados do produto e publico"
  - field: positioning_output
    type: PositioningOutput
    source: "createPositioning()"
    required: true
    description: "Posicionamento estrategico com angulo de ataque e framework selecionado"
  - field: awareness_mapping
    type: AwarenessMappingOutput
    source: "mapAwarenessLevel()"
    required: true
    description: "Mapeamento do nivel de consciencia com abordagem de headline recomendada"

outputs:
  - field: headline_output
    type: HeadlineOutput
    destination: design-captain
    schema:
      primary_headline: string
      sub_headline: string
      headline_variations:
        - text: string
          approach: string
          target_awareness: string
      section_headlines:
        hero: string
        problem: string
        solution: string
        benefits: string
        testimonials: string
        offer: string
        faq: string
        final_cta: string
      power_words_used: string[]
      emotional_trigger: string

quality_gate:
  blocking:
    - "Headline principal definida com no maximo 15 palavras"
    - "Sub-headline complementa a headline sem repetir informacao"
    - "Headline alinhada com o nivel de consciencia mapeado"
    - "Pelo menos 3 variacoes de headline geradas para teste"
    - "Headlines de secao definidas para todas as secoes selecionadas"
  non_blocking:
    - "Palavras de poder (power words) identificadas e utilizadas"
    - "Gatilho emocional principal documentado"
    - "Headlines otimizadas para escaneamento visual (scanning)"

execution:
  steps:
    - step: 1
      action: "Analisar direcao de headline do posicionamento"
      description: >
        Revisar o headline_direction definido no posicionamento estrategico
        e a abordagem de headline recomendada pelo mapeamento de nivel de
        consciencia. Estas duas fontes definem o territorio criativo.
    - step: 2
      action: "Gerar variacoes de headline principal"
      description: >
        Criar no minimo 5 variacoes de headline principal, cada uma usando
        uma abordagem diferente (curiosidade, beneficio direto, prova,
        provocacao, identificacao). Selecionar a mais forte como primaria.
    - step: 3
      action: "Criar sub-headline complementar"
      description: >
        A sub-headline deve expandir a promessa da headline, adicionar
        especificidade (numeros, prazos, mecanismo) e resolver ambiguidades.
        Maximo de 30 palavras.
    - step: 4
      action: "Definir headlines de secao"
      description: >
        Para cada secao da pagina (hero, problema, solucao, beneficios,
        depoimentos, oferta, perguntas frequentes, chamada para acao final),
        criar uma headline que mantenha a narrativa progressiva e impulsione
        o leitor para a proxima secao.
    - step: 5
      action: "Revisar coerencia narrativa"
      description: >
        Verificar que todas as headlines juntas contam uma historia coerente
        quando lidas em sequencia (headline scanning). O visitante que le
        apenas as headlines deve entender a oferta completa.

error_handling:
  - condition: "Headline principal excede 15 palavras"
    action: "Reescrever de forma mais concisa, movendo informacao extra para a sub-headline"
  - condition: "Headline nao se alinha com o nivel de consciencia"
    action: "Consultar awareness-levels.yaml para o tipo de abordagem correto e reescrever"
---

# Tarefa: Escrever Headlines

## Contexto

A headline e responsavel por 80% da decisao do visitante de continuar ou abandonar
a pagina. Segundo David Ogilvy, 5 vezes mais pessoas leem a headline do que o corpo
do texto. Esta tarefa e, portanto, o ponto de maior alavancagem de todo o pipeline
de copy.

## Responsavel

**@copy-captain** com delegacao para **@headline-specialist-lieutenant**

## Regras de Ouro

1. Maximo 15 palavras na headline principal
2. Deve falar diretamente com o publico-alvo (identificacao imediata)
3. Deve prometer um beneficio ou despertar curiosidade (nunca ambos ao mesmo tempo)
4. Nunca usar jargao ou termos que o publico nao entende instantaneamente
5. Headlines de secao devem funcionar como uma "historia de scanning"
