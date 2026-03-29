---
task: validateOutput()
version: "1.0.0"
responsible: "@quality-captain"
delegates_to:
  - "@qa-validator-lieutenant"
  - "@accessibility-sergeant"
  - "@conversion-audit-sergeant"
atomic_layer: Task
elicit: false
description: >
  Valida o HTML gerado contra todos os criterios de qualidade definidos nas
  quality gates de cada tarefa anterior, executa verificacoes de acessibilidade,
  performance, consistencia de copy e otimizacao para conversao. Emite
  relatorio de qualidade e decide se a saida esta pronta para entrega ou
  precisa retornar para correcao.

inputs:
  - field: html_output
    type: HTMLOutput
    source: "generateHTML()"
    required: true
    description: "HTML autocontido gerado para validacao"
  - field: briefing_output
    type: BriefingOutput
    source: "@site-commander"
    required: true
    description: "Briefing original para verificacao de aderencia"
  - field: positioning_output
    type: PositioningOutput
    source: "createPositioning()"
    required: true
    description: "Posicionamento para validacao de consistencia de copy"
  - field: all_quality_gates
    type: QualityGateCollection
    source: "todas as tarefas anteriores"
    required: true
    description: "Colecao de todos os quality gates definidos nas tarefas do pipeline"

outputs:
  - field: validation_report
    type: ValidationReport
    destination: "@site-commander"
    schema:
      overall_status: string
      overall_score: number
      categories:
        html_validity:
          status: string
          score: number
          issues: object[]
        responsiveness:
          status: string
          score: number
          issues: object[]
        accessibility:
          status: string
          score: number
          issues: object[]
        copy_consistency:
          status: string
          score: number
          issues: object[]
        conversion_optimization:
          status: string
          score: number
          issues: object[]
        performance:
          status: string
          score: number
          issues: object[]
        seo_basics:
          status: string
          score: number
          issues: object[]
      blocking_issues: object[]
      non_blocking_issues: object[]
      recommendations: string[]
      approved_for_delivery: boolean

quality_gate:
  blocking:
    - "Nenhum problema bloqueante encontrado em nenhuma categoria"
    - "Pontuacao geral acima de 80 pontos (escala de 0 a 100)"
    - "HTML renderiza corretamente sem erros visuais criticos"
    - "Todas as chamadas para acao estao funcionais e clicaveis"
    - "Design responsivo funcional nos 3 breakpoints"
    - "Contraste de texto atende WCAG 2.1 nivel AA"
  non_blocking:
    - "Pontuacao de performance estimada acima de 90"
    - "Todas as recomendacoes de melhoria documentadas"
    - "Schema.org markup presente e valido"
    - "Open Graph tags configuradas para compartilhamento social"

execution:
  steps:
    - step: 1
      action: "Validar estrutura HTML"
      description: >
        Verificar sintaxe HTML5, tags de fechamento, atributos obrigatorios,
        meta tags essenciais, estrutura semantica (header, main, footer,
        section, article) e ausencia de erros que quebrem renderizacao.
    - step: 2
      action: "Verificar responsividade"
      description: >
        Simular renderizacao nos 3 breakpoints (360 pixels mobile, 768 pixels
        tablet, 1440 pixels desktop). Verificar que nenhum conteudo fica
        cortado, sobreposto ou ilegivel em nenhuma resolucao.
    - step: 3
      action: "Auditar acessibilidade"
      description: >
        Verificar contraste de cores (WCAG 2.1 nivel AA), atributos alt em
        imagens, rotulos em formularios, hierarquia de headings (h1 a h6
        sem pular niveis), tamanho minimo de toque em botoes (44x44 pixels).
    - step: 4
      action: "Validar consistencia de copy"
      description: >
        Comparar textos do HTML com os outputs de headline, body copy,
        chamadas para acao e FAQ. Verificar que nenhum texto foi corrompido,
        truncado ou substituido incorretamente durante a geracao do HTML.
    - step: 5
      action: "Auditar otimizacao para conversao"
      description: >
        Verificar: chamada para acao acima da dobra, botoes com contraste
        suficiente, fluxo visual guia para conversao, elementos de urgencia
        visiveis, garantia proxima a chamada para acao, prova social antes
        da oferta, formularios simples e sem campos desnecessarios.
    - step: 6
      action: "Estimar metricas de performance"
      description: >
        Avaliar tamanho total do arquivo, numero de requisicoes externas
        (fontes, imagens), presenca de otimizacoes (preconnect, lazy loading,
        font-display: swap) e estimar pontuacao Lighthouse.
    - step: 7
      action: "Compilar relatorio e decidir"
      description: >
        Gerar relatorio completo com pontuacao por categoria, lista de
        problemas bloqueantes e nao bloqueantes, e recomendacoes de melhoria.
        Se existem problemas bloqueantes, marcar approved_for_delivery como
        falso e indicar quais tarefas precisam reprocessar seus outputs.

error_handling:
  - condition: "Problemas bloqueantes encontrados"
    action: "Retornar relatorio detalhado ao site-commander com indicacao exata de quais tarefas e secoes precisam de correcao. O site-commander decidira se reenvia para a tarefa responsavel ou corrige inline."
  - condition: "Pontuacao geral entre 70 e 80 (limiar)"
    action: "Aprovar condicionalmente com lista de melhorias recomendadas. Informar ao usuario que a pagina e funcional mas pode ser aprimorada."
  - condition: "Pontuacao geral abaixo de 70"
    action: "Rejeitar e solicitar reprocessamento completo da fase de desenvolvimento (generateHTML). Incluir diagnostico detalhado do que precisa ser corrigido."

scoring:
  weights:
    html_validity: 15
    responsiveness: 20
    accessibility: 15
    copy_consistency: 15
    conversion_optimization: 25
    performance: 5
    seo_basics: 5
  total: 100
  thresholds:
    approved: 80
    conditional: 70
    rejected: 0
---

# Tarefa: Validar Saida Final

## Contexto

A validacao e o controle de qualidade final antes da entrega ao usuario. Nenhum
HTML sai do pipeline sem passar por esta verificacao. O esquadrao de qualidade
atua como o ultimo guardiao, garantindo que o produto entregue atende aos padroes
de excelencia definidos pelo framework.

## Responsavel

**@quality-captain** com delegacao para **@qa-validator-lieutenant**,
**@accessibility-sergeant** e **@conversion-audit-sergeant**

## Sistema de Pontuacao

| Categoria                          | Peso |
|------------------------------------|------|
| Validade do HTML                   | 15%  |
| Responsividade                     | 20%  |
| Acessibilidade                     | 15%  |
| Consistencia de Copy               | 15%  |
| Otimizacao para Conversao          | 25%  |
| Performance                        |  5%  |
| Fundamentos de SEO                 |  5%  |

## Limiares de Decisao

- **80+ pontos**: Aprovado para entrega
- **70-79 pontos**: Aprovado condicionalmente com recomendacoes
- **Abaixo de 70**: Rejeitado, retorna para correcao
