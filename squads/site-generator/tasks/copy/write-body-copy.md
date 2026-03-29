---
task: writeBodyCopy()
version: "1.0.0"
responsible: "@copy-captain"
delegates_to:
  - "@body-copy-sergeant"
  - "@storytelling-sergeant"
atomic_layer: Task
elicit: false
description: >
  Escreve o corpo completo da copy da pagina, incluindo secoes de problema,
  solucao, beneficios, mecanismo unico, prova social, oferta e argumentacao
  final. Aplica o framework de copywriting selecionado e adapta comprimento
  e intensidade ao nivel de consciencia do publico.

inputs:
  - field: briefing_output
    type: BriefingOutput
    source: "@site-commander"
    required: true
    description: "Briefing com todas as informacoes do produto e publico"
  - field: positioning_output
    type: PositioningOutput
    source: "createPositioning()"
    required: true
    description: "Posicionamento, framework selecionado e mapa de objecoes"
  - field: value_stack_output
    type: ValueStackOutput
    source: "buildValueStack()"
    required: true
    description: "Empilhamento de valor completo para secao de oferta"
  - field: awareness_mapping
    type: AwarenessMappingOutput
    source: "mapAwarenessLevel()"
    required: true
    description: "Nivel de consciencia com contagem estimada de palavras e proporcao emocional/racional"
  - field: headline_output
    type: HeadlineOutput
    source: "writeHeadline()"
    required: true
    description: "Headlines ja aprovadas para manter coerencia narrativa"

outputs:
  - field: body_copy_output
    type: BodyCopyOutput
    destination: design-captain
    schema:
      sections:
        - section_id: string
          section_type: string
          headline: string
          body_text: string
          bullet_points: string[]
          cta_text: string | null
          cta_url: string | null
      total_word_count: number
      reading_time_minutes: number
      framework_applied: string
      tone_consistency_score: number

quality_gate:
  blocking:
    - "Todas as secoes definidas na sequencia de pagina possuem corpo de texto"
    - "Contagem total de palavras dentro do intervalo recomendado para o nivel de consciencia"
    - "Framework de copywriting aplicado de forma consistente ao longo do texto"
    - "Tom de comunicacao uniforme e alinhado com o brand_tone do briefing"
    - "Secao de oferta inclui todos os componentes do value stack"
  non_blocking:
    - "Bullet points usados para facilitar escaneamento visual"
    - "Transicoes entre secoes fluidas e naturais"
    - "Objecoes do mapa de objecoes endereçadas ao longo do texto"
    - "Texto otimizado para leitura em dispositivos moveis (paragrafos curtos)"

execution:
  steps:
    - step: 1
      action: "Definir estrutura de secoes"
      description: >
        Baseado na sequencia de secoes do awareness_mapping, criar o
        esqueleto de cada secao com headline (do headline_output),
        proposito argumentativo e extensao estimada.
    - step: 2
      action: "Escrever secao de problema/dor"
      description: >
        Articular o problema do publico-alvo com linguagem emocional e
        especifica. Usar tecnica de agitacao (PAS) ou identificacao por
        historia (Star-Story-Solution) conforme o framework selecionado.
    - step: 3
      action: "Escrever secao de solucao/mecanismo"
      description: >
        Apresentar o produto como a solucao, enfatizando o mecanismo
        unico que o diferencia. Explicar COMO funciona de forma que o
        prospect acredite que "desta vez sera diferente".
    - step: 4
      action: "Escrever secao de beneficios"
      description: >
        Listar beneficios (nao funcionalidades) usando bullet points com
        formato "Beneficio + Resultado". Cada bullet deve pintar um quadro
        mental do resultado desejado.
    - step: 5
      action: "Escrever secao de prova social"
      description: >
        Incorporar depoimentos do briefing (se fornecidos) ou criar
        placeholders estruturados. Adicionar elementos de autoridade,
        credenciais e numeros de impacto.
    - step: 6
      action: "Escrever secao de oferta"
      description: >
        Montar a apresentacao de oferta seguindo a estrutura do value_stack:
        revelar cada componente de valor, acumular valor percebido, aplicar
        ancoragem de preco e revelar o preco real como oportunidade.
    - step: 7
      action: "Escrever argumentacao final e chamada para acao"
      description: >
        Resumir a transformacao prometida, enderecar a ultima objecao
        (geralmente risco, resolvido pela garantia) e fechar com uma
        chamada para acao poderosa e urgente.
    - step: 8
      action: "Revisar coerencia e tom"
      description: >
        Reler todo o texto verificando consistencia de tom, fluidez entre
        secoes, ausencia de repeticoes desnecessarias e alinhamento com
        o framework selecionado.

error_handling:
  - condition: "Texto excede significativamente a contagem recomendada"
    action: "Editar para remover redundancias e paragrafos nao essenciais, mantendo todos os argumentos centrais"
  - condition: "Depoimentos nao fornecidos no briefing"
    action: "Criar secao de prova social com placeholders claramente marcados como '[INSERIR DEPOIMENTO]' para preenchimento posterior"
  - condition: "Tom inconsistente entre secoes"
    action: "Reescrever secoes desalinhadas usando o brand_tone como referencia de calibracao"
---

# Tarefa: Escrever Corpo da Copy

## Contexto

O corpo da copy e onde a venda acontece de fato. Enquanto a headline captura atencao,
o corpo da copy constroi desejo, elimina objecoes e conduz o visitante ate a decisao
de conversao. Cada secao tem um papel especifico na jornada de persuasao.

## Responsavel

**@copy-captain** com delegacao para **@body-copy-sergeant** e **@storytelling-sergeant**

## Comprimento por Nivel de Consciencia

- Completamente Inconsciente: 3000-5000 palavras (pagina longa com muita educacao)
- Consciente do Problema: 2000-3500 palavras (argumentacao completa)
- Consciente da Solucao: 1500-2500 palavras (foco em diferenciacao)
- Consciente do Produto: 800-1500 palavras (foco em oferta)
- Totalmente Consciente: 300-800 palavras (direto a chamada para acao)
