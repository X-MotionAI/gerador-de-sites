---
task: buildValueStack()
version: "1.0.0"
responsible: "@strategy-captain"
delegates_to:
  - "@offer-architect-sergeant"
atomic_layer: Task
elicit: false
description: >
  Constroi o empilhamento de valor (value stack) da oferta, organizando todos
  os componentes de valor — produto principal, bonus, garantia, ancoragem de
  preco — em uma estrutura persuasiva que maximiza o valor percebido e justifica
  o investimento solicitado.

inputs:
  - field: briefing_output
    type: BriefingOutput
    source: "@site-commander"
    required: true
    description: "Briefing com informacoes do produto, preco, bonus e garantia"
  - field: positioning_output
    type: PositioningOutput
    source: "createPositioning()"
    required: true
    description: "Posicionamento estrategico ja definido"

outputs:
  - field: value_stack_output
    type: ValueStackOutput
    destination: copy-captain
    schema:
      main_offer:
        name: string
        description: string
        perceived_value: string
      bonus_items:
        - name: string
          description: string
          perceived_value: string
          delivery_format: string
      total_perceived_value: string
      actual_price: string
      savings_message: string
      price_anchor: string
      guarantee:
        type: string
        duration: string
        description: string
      urgency_elements: string[]
      value_justification_narrative: string

quality_gate:
  blocking:
    - "Oferta principal definida com nome, descricao e valor percebido"
    - "Preco real informado e presente na estrutura"
    - "Valor percebido total e superior ao preco real em pelo menos 3 vezes"
    - "Narrativa de justificacao de valor coerente com o posicionamento"
  non_blocking:
    - "Pelo menos 2 itens de bonus incluidos (se aplicavel ao tipo de pagina)"
    - "Garantia presente e formatada (se aplicavel)"
    - "Elementos de urgencia configurados (se aplicavel)"
    - "Ancoragem de preco definida com pelo menos 2 niveis de comparacao"

execution:
  steps:
    - step: 1
      action: "Catalogar todos os componentes de valor"
      description: >
        Extrair do briefing o produto principal, todos os bonus informados,
        a garantia e qualquer elemento adicional de valor. Se bonus nao
        foram informados, sugerir bonus logicos baseados no tipo de produto.
    - step: 2
      action: "Atribuir valores percebidos"
      description: >
        Para cada componente de valor, definir um valor percebido realista
        e justificavel. O valor percebido deve ser baseado em quanto o
        cliente pagaria se adquirisse cada item separadamente.
    - step: 3
      action: "Construir ancoragem de preco"
      description: >
        Criar a sequencia de ancoragem que mostra o valor total percebido,
        depois revela o preco real como uma fracao do valor total, gerando
        a percepcao de oportunidade excepcional.
    - step: 4
      action: "Formular narrativa de justificacao"
      description: >
        Escrever a narrativa que explica POR QUE o preco e tao inferior
        ao valor percebido. Deve ser autentica e alinhada com os valores
        da marca (missao, democratizacao de acesso, oferta de lancamento, etc).

error_handling:
  - condition: "Preco e zero (oferta gratuita de captura)"
    action: "Adaptar o value stack para enfatizar o valor do conteudo gratuito e o que o lead receberá, sem ancoragem de preco monetario"
  - condition: "Nenhum bonus informado"
    action: "Sugerir 2-3 bonus coerentes com o produto e o publico, marcando como sugestoes para aprovacao do usuario"
---

# Tarefa: Construir Empilhamento de Valor

## Contexto

O empilhamento de valor (value stack) e a tecnica de apresentacao de oferta onde cada
componente de valor e revelado progressivamente, acumulando valor percebido antes de
revelar o preco final. Inspirado na metodologia de Alex Hormozi em "$100M Offers".

## Responsavel

**@strategy-captain** com delegacao para **@offer-architect-sergeant**

## Principio Central

O valor percebido total deve ser no minimo 3 vezes superior ao preco real cobrado,
criando uma percepcao de oportunidade irrecusavel para o visitante.
