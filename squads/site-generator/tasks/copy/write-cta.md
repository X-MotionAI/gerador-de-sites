---
task: writeCTA()
version: "1.0.0"
responsible: "@copy-captain"
delegates_to:
  - "@cta-specialist-sergeant"
atomic_layer: Task
elicit: false
description: >
  Cria todas as chamadas para acao (CTAs) da pagina, incluindo textos dos
  botoes, micro-copy de suporte, textos de urgencia e elementos de reducao
  de risco ao redor de cada ponto de conversao.

inputs:
  - field: briefing_output
    type: BriefingOutput
    source: "@site-commander"
    required: true
    description: "Briefing com objetivo de conversao, preco e garantia"
  - field: positioning_output
    type: PositioningOutput
    source: "createPositioning()"
    required: true
    description: "Posicionamento com promessa de transformacao"
  - field: awareness_mapping
    type: AwarenessMappingOutput
    source: "mapAwarenessLevel()"
    required: true
    description: "Nivel de consciencia com estilo de chamada para acao recomendado"
  - field: value_stack_output
    type: ValueStackOutput
    source: "buildValueStack()"
    required: true
    description: "Value stack com garantia e elementos de urgencia"

outputs:
  - field: cta_output
    type: CTAOutput
    destination: design-captain
    schema:
      primary_cta:
        button_text: string
        support_text: string
        urgency_text: string | null
        risk_reversal_text: string | null
      secondary_ctas:
        - location: string
          button_text: string
          support_text: string
      micro_copy:
        below_button: string
        security_badges: string[]
        guarantee_reminder: string | null
      cta_variations:
        - text: string
          approach: string
      checkout_url: string

quality_gate:
  blocking:
    - "Chamada para acao principal definida com texto do botao de no maximo 8 palavras"
    - "Texto do botao orientado a acao (comeca com verbo no imperativo ou primeira pessoa)"
    - "Chamada para acao alinhada com o objetivo de conversao do briefing"
    - "URL de checkout ou destino definida"
  non_blocking:
    - "Pelo menos 3 variacoes de texto de botao geradas"
    - "Micro-copy de suporte reduz percepcao de risco"
    - "Elementos de urgencia presentes (se aplicavel)"
    - "Chamadas para acao secundarias posicionadas em pontos estrategicos"

execution:
  steps:
    - step: 1
      action: "Definir chamada para acao principal"
      description: >
        Criar o texto do botao principal baseado no objetivo de conversao:
        compra ("Quero Garantir Minha Vaga"), captura ("Baixar Agora Gratuitamente"),
        registro ("Reservar Minha Vaga"), contato ("Falar com Especialista").
        O texto deve ser em primeira pessoa e orientado ao resultado.
    - step: 2
      action: "Criar micro-copy de suporte"
      description: >
        Escrever texto de suporte que aparece abaixo ou ao redor do botao:
        indicadores de seguranca ("Pagamento 100% seguro"), garantia
        ("7 dias de garantia incondicional"), escassez ("Apenas 23 vagas restantes").
    - step: 3
      action: "Definir chamadas para acao secundarias"
      description: >
        Posicionar chamadas para acao intermediarias em pontos estrategicos
        da pagina (apos secao de beneficios, apos depoimentos, apos oferta).
        Variar o texto para evitar repeticao monotona.
    - step: 4
      action: "Gerar variacoes para teste"
      description: >
        Criar no minimo 3 variacoes de texto de botao com abordagens
        diferentes (beneficio, urgencia, curiosidade) para possibilitar
        testes A/B futuros.

error_handling:
  - condition: "Objetivo de conversao e WhatsApp"
    action: "Adaptar chamada para acao para formato de link de WhatsApp com mensagem pre-preenchida"
  - condition: "URL de checkout nao fornecida"
    action: "Usar '#' como placeholder e incluir comentario no codigo HTML indicando onde inserir a URL real"
  - condition: "Pagina do tipo squeeze (captura) sem formulario"
    action: "Gerar texto para botao que abre formulario de email integrado na propria secao"
---

# Tarefa: Escrever Chamadas para Acao

## Contexto

As chamadas para acao sao os pontos de conversao da pagina — onde o visitante se
transforma em lead ou cliente. Cada elemento ao redor da chamada para acao deve
reduzir friccao, aumentar desejo e minimizar percepcao de risco.

## Responsavel

**@copy-captain** com delegacao para **@cta-specialist-sergeant**

## Principios de Chamada para Acao Eficaz

1. Texto do botao em primeira pessoa ("Quero minha vaga" em vez de "Inscreva-se")
2. Orientado ao resultado, nao a acao mecanica
3. Maximo 8 palavras no texto do botao
4. Micro-copy de suporte reduz a ultima objecao
5. Repetir a chamada para acao em pelo menos 3 pontos da pagina
