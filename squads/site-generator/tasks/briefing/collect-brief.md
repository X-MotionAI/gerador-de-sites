---
task: collectBrief()
version: "1.0.0"
responsible: "@site-commander"
atomic_layer: Task
elicit: true
description: >
  Coleta estruturada de informacoes do briefing do usuario usando o banco de
  perguntas de elicitacao (elicitation-questions.yaml). Aplica deteccao
  inteligente para minimizar perguntas explicitas e garante que todas as
  informacoes essenciais sejam coletadas antes de avancar para a fase de
  estrategia.

inputs:
  - field: user_message
    type: string
    required: true
    description: "Mensagem inicial do usuario descrevendo o que deseja"
  - field: elicitation_bank
    type: ElicitationQuestions
    source: "data/elicitation-questions.yaml"
    required: true
    description: "Banco completo de perguntas de elicitacao estruturadas em 3 fases"

outputs:
  - field: briefing_output
    type: BriefingOutput
    destination: strategy-captain
    schema:
      page_type: string
      product_name: string
      product_description: string
      target_audience: string
      main_problem: string
      conversion_goal: string
      price: string
      awareness_level: string
      competitors: string | null
      unique_mechanism: string | null
      brand_colors: string | null
      brand_tone: string
      existing_testimonials: string | null
      guarantee: string | null
      bonus_items: string | null
      urgency_element: string | null
      logo_url: string | null
      hero_image: string | null
      tracking: string | null
      payment_platform: string | null
      checkout_url: string | null
      ai_inferred_fields: string[]
      confidence_scores: object

quality_gate:
  blocking:
    - "Todas as perguntas da Fase 1 respondidas ou inferidas com confianca acima de 85%"
    - "O campo page_type contem um valor valido dentre as opcoes permitidas"
    - "O campo product_description possui no minimo 50 caracteres"
    - "O campo target_audience possui no minimo 20 caracteres"
    - "O campo conversion_goal contem um valor valido dentre as opcoes permitidas"
  non_blocking:
    - "Perguntas da Fase 2 parcialmente respondidas"
    - "Perguntas da Fase 3 podem estar todas vazias"
    - "Nivel de consciencia (awareness_level) pode ser 'auto' para deteccao posterior"

execution:
  steps:
    - step: 1
      action: "Analisar mensagem inicial do usuario"
      description: >
        Processar a mensagem do usuario e tentar auto-detectar respostas para
        o maximo de perguntas possivel usando as dicas de deteccao (ai_detection_hint)
        de cada pergunta no banco de elicitacao.
    - step: 2
      action: "Identificar lacunas essenciais"
      description: >
        Comparar campos detectados com os campos obrigatorios da Fase 1.
        Gerar lista de perguntas pendentes ordenada por prioridade.
    - step: 3
      action: "Conduzir elicitacao progressiva"
      description: >
        Fazer no maximo 3 perguntas por turno de conversa, priorizando Fase 1.
        Continuar ate que todas as perguntas da Fase 1 estejam respondidas.
        Avancar para Fase 2 somente apos Fase 1 completa.
    - step: 4
      action: "Apresentar resumo para confirmacao"
      description: >
        Exibir resumo estruturado de todas as informacoes coletadas, destacando
        valores inferidos pela inteligencia artificial. Solicitar confirmacao
        ou correcoes do usuario antes de prosseguir.
    - step: 5
      action: "Montar e enviar BriefingOutput"
      description: >
        Compilar todas as informacoes confirmadas no formato BriefingOutput
        e rotear para o strategy-captain iniciar a fase de estrategia.

error_handling:
  - condition: "Usuario recusa responder perguntas da Fase 1"
    action: "Explicar que as informacoes sao essenciais e oferecer alternativas como exemplos ou sugestoes baseadas no contexto disponivel"
  - condition: "Informacoes contraditorias detectadas"
    action: "Apresentar a contradicao ao usuario e solicitar esclarecimento antes de prosseguir"
  - condition: "Descricao do produto muito vaga (menos de 50 caracteres)"
    action: "Solicitar mais detalhes com perguntas direcionadas sobre funcionalidades, beneficios e resultados entregues"
---

# Tarefa: Coletar Briefing Completo

## Contexto

Esta tarefa e o ponto de entrada de todo o pipeline de geracao de sites. O Comandante
Atlas recebe a mensagem inicial do usuario e conduz uma elicitacao estruturada e
inteligente para coletar todas as informacoes necessarias para a geracao.

## Responsavel

**@site-commander (Atlas)** — Comandante Supremo de Geracao de Sites

## Fluxo de Execucao

1. **Parsing Inteligente**: Analisar a primeira mensagem e extrair automaticamente o maximo de informacoes possiveis
2. **Elicitacao Progressiva**: Fazer perguntas complementares em lotes de no maximo 3, priorizando a Fase 1
3. **Validacao**: Verificar que todos os campos obrigatorios atendem aos criterios de qualidade
4. **Confirmacao**: Apresentar resumo e obter aprovacao do usuario
5. **Roteamento**: Enviar BriefingOutput para o strategy-captain

## Criterios de Sucesso

- Todas as 7 perguntas essenciais da Fase 1 respondidas
- Pelo menos 50% das perguntas estrategicas da Fase 2 respondidas ou inferidas
- Usuario confirmou o resumo das informacoes coletadas
- BriefingOutput montado e validado contra o quality_gate
