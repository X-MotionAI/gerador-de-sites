---
task: writeFAQ()
version: "1.0.0"
responsible: "@copy-captain"
delegates_to:
  - "@objection-handler-sergeant"
atomic_layer: Task
elicit: false
description: >
  Cria a secao de Perguntas Frequentes (FAQ) da pagina, transformando objecoes
  mapeadas na fase de estrategia em perguntas e respostas persuasivas que
  eliminam duvidas e reduzem barreiras de conversao.

inputs:
  - field: briefing_output
    type: BriefingOutput
    source: "@site-commander"
    required: true
    description: "Briefing com dados do produto, publico e garantia"
  - field: positioning_output
    type: PositioningOutput
    source: "createPositioning()"
    required: true
    description: "Posicionamento com mapa de objecoes e contra-argumentos"
  - field: body_copy_output
    type: BodyCopyOutput
    source: "writeBodyCopy()"
    required: true
    description: "Corpo da copy para verificar quais objecoes ja foram endereçadas"

outputs:
  - field: faq_output
    type: FAQOutput
    destination: design-captain
    schema:
      faq_items:
        - question: string
          answer: string
          category: string
          priority: number
          addresses_objection: string | null
      total_items: number
      schema_markup_ready: boolean

quality_gate:
  blocking:
    - "Minimo de 5 perguntas e respostas criadas"
    - "Maximo de 12 perguntas e respostas (evitar excesso)"
    - "Cada resposta com no maximo 150 palavras"
    - "Todas as objecoes criticas do mapa de objecoes endereçadas"
    - "Perguntas escritas na perspectiva do cliente (primeira ou segunda pessoa)"
  non_blocking:
    - "Perguntas ordenadas por prioridade (objecoes mais comuns primeiro)"
    - "Respostas incluem elementos de prova social quando apropriado"
    - "FAQ formatada para compatibilidade com Schema.org (marcacao estruturada)"
    - "Categorias atribuidas (produto, pagamento, garantia, suporte, entrega)"

execution:
  steps:
    - step: 1
      action: "Extrair objecoes nao resolvidas"
      description: >
        Comparar o mapa de objecoes do posicionamento com o corpo da copy
        ja escrito. Identificar quais objecoes foram endereçadas no texto
        e quais ainda precisam de tratamento explicito na FAQ.
    - step: 2
      action: "Gerar perguntas baseadas em objecoes"
      description: >
        Transformar cada objecao pendente em uma pergunta formulada na
        linguagem do cliente. A pergunta deve soar natural, como algo
        que um prospect real perguntaria.
    - step: 3
      action: "Adicionar perguntas operacionais"
      description: >
        Incluir perguntas praticas sobre como funciona o pagamento,
        como acessar o produto, qual o prazo de entrega, como funciona
        a garantia e como contatar o suporte.
    - step: 4
      action: "Escrever respostas persuasivas"
      description: >
        Cada resposta deve: (1) validar a preocupacao, (2) resolver a
        duvida com informacao concreta, (3) terminar com um reforco de
        beneficio ou prova social quando possivel.
    - step: 5
      action: "Ordenar por prioridade"
      description: >
        Colocar primeiro as perguntas que endereçam as objecoes mais
        comuns e mais criticas para a conversao. Perguntas operacionais
        ficam no final.

error_handling:
  - condition: "Mapa de objecoes vazio ou insuficiente"
    action: "Gerar objecoes genericas baseadas no tipo de produto e publico-alvo: preco, confianca, resultado, tempo, complexidade"
  - condition: "Numero de perguntas excede 12"
    action: "Priorizar e manter apenas as 10 mais relevantes para conversao, removendo perguntas redundantes"
---

# Tarefa: Escrever Perguntas Frequentes

## Contexto

A secao de Perguntas Frequentes (FAQ) nao e apenas um repositorio de informacoes — e
uma ferramenta estrategica de superacao de objecoes. Cada pergunta representa uma
barreira que impede a conversao, e cada resposta e uma oportunidade de eliminar essa
barreira e reforcar o desejo de compra.

## Responsavel

**@copy-captain** com delegacao para **@objection-handler-sergeant**

## Estrutura de Resposta Eficaz

1. **Validar**: "Otima pergunta!" ou "Muitas pessoas nos perguntam isso"
2. **Responder**: Informacao concreta e direta
3. **Reforcar**: Beneficio ou prova social relacionada
