---
task: generateHTML()
version: "1.0.0"
responsible: "@dev-captain"
delegates_to:
  - "@html-builder-lieutenant"
  - "@css-specialist-sergeant"
  - "@performance-sergeant"
atomic_layer: Task
elicit: false
description: >
  Gera o arquivo HTML autocontido final da pagina, integrando todo o conteudo
  de copy, layout, estilo visual, formularios, scripts de rastreamento e
  otimizacoes de performance em um unico arquivo HTML pronto para deploy.

inputs:
  - field: layout_output
    type: LayoutOutput
    source: "createLayout()"
    required: true
    description: "Layout completo com estrutura de secoes e grade responsiva"
  - field: visual_style_output
    type: VisualStyleOutput
    source: "applyVisualStyle()"
    required: true
    description: "Estilo visual com paleta, tipografia e CSS custom properties"
  - field: headline_output
    type: HeadlineOutput
    source: "writeHeadline()"
    required: true
    description: "Headlines para todas as secoes"
  - field: body_copy_output
    type: BodyCopyOutput
    source: "writeBodyCopy()"
    required: true
    description: "Corpo de texto para todas as secoes"
  - field: cta_output
    type: CTAOutput
    source: "writeCTA()"
    required: true
    description: "Chamadas para acao com textos e URLs"
  - field: faq_output
    type: FAQOutput
    source: "writeFAQ()"
    required: true
    description: "Perguntas frequentes formatadas"
  - field: briefing_output
    type: BriefingOutput
    source: "@site-commander"
    required: true
    description: "Briefing com logo, imagens, tracking e informacoes tecnicas"
  - field: section_templates
    type: SectionTemplates
    source: "templates/sections/"
    required: true
    description: "Templates HTML de secoes reutilizaveis"

outputs:
  - field: html_output
    type: HTMLOutput
    destination: quality-captain
    schema:
      html_content: string
      file_size_kb: number
      sections_count: number
      has_responsive_design: boolean
      has_tracking_codes: boolean
      lighthouse_estimates:
        performance: number
        accessibility: number
        best_practices: number
        seo: number
      meta_tags: object

quality_gate:
  blocking:
    - "HTML valido (sem erros de sintaxe que quebrem renderizacao)"
    - "CSS totalmente inline ou em tag <style> dentro do <head> (arquivo autocontido)"
    - "Design responsivo funcional em mobile (360 pixels), tablet (768 pixels) e desktop (1440 pixels)"
    - "Todas as secoes do layout presentes no HTML final"
    - "Todos os textos de copy integrados corretamente nas secoes correspondentes"
    - "Botoes de chamada para acao com URLs corretas e funcionais"
    - "Meta tags essenciais presentes (title, description, viewport, charset)"
  non_blocking:
    - "Tamanho total do arquivo abaixo de 200 kilobytes"
    - "Fontes do Google Fonts carregadas com display=swap"
    - "Imagens com atributos alt descritivos"
    - "Schema.org markup para FAQ (se secao de FAQ presente)"
    - "Open Graph tags para compartilhamento em redes sociais"
    - "Codigos de rastreamento integrados (se fornecidos no briefing)"
    - "Favicon referenciado (se logo fornecido)"
    - "Animacoes CSS suaves para entrada de secoes"
    - "Performance estimada acima de 90 no Lighthouse"

execution:
  steps:
    - step: 1
      action: "Montar estrutura base do HTML"
      description: >
        Criar o esqueleto HTML5 com doctype, meta tags essenciais (charset
        UTF-8, viewport para responsividade), titulo da pagina, e tag
        <style> para todo o CSS. Incluir referencia ao Google Fonts.
    - step: 2
      action: "Injetar variaveis CSS"
      description: >
        Inserir todas as CSS custom properties do visual_style_output
        na raiz (:root) do documento. Adicionar estilos globais de reset
        e tipografia base.
    - step: 3
      action: "Construir secoes a partir dos templates"
      description: >
        Para cada secao do layout, carregar o template HTML correspondente
        do catalogo de secoes, substituir os placeholders pelos conteudos
        reais (headlines, textos, imagens, botoes) e aplicar as classes
        CSS de estilo e responsividade.
    - step: 4
      action: "Integrar formularios e chamadas para acao"
      description: >
        Inserir formularios de captura (se pagina de captura), botoes de
        chamada para acao com URLs de checkout, links de WhatsApp com
        mensagem pre-preenchida, ou outros mecanismos de conversao
        conforme o objetivo definido no briefing.
    - step: 5
      action: "Adicionar scripts de rastreamento"
      description: >
        Inserir codigos do Google Analytics, Meta Pixel, Google Tag Manager
        ou outros sistemas de rastreamento informados no briefing. Posicionar
        no <head> ou antes do </body> conforme melhores praticas de cada
        plataforma.
    - step: 6
      action: "Otimizar performance"
      description: >
        Minificar CSS inline, otimizar carregamento de fontes (preconnect,
        font-display: swap), adicionar lazy loading em imagens abaixo da
        dobra, e garantir que o CSS critico esta inline no <head>.
    - step: 7
      action: "Validar HTML gerado"
      description: >
        Verificar sintaxe HTML, fechar todas as tags, validar que URLs
        estao corretas, testar que o CSS responsivo funciona nos 3
        breakpoints e que nenhum conteudo esta faltando.

error_handling:
  - condition: "Template de secao nao encontrado"
    action: "Gerar HTML da secao manualmente usando a estrutura do layout_output como guia"
  - condition: "Arquivo HTML excede 200 kilobytes"
    action: "Otimizar CSS removendo estilos nao utilizados, reduzir verbosidade do HTML e considerar compressao de fontes inline"
  - condition: "Imagem referenciada com URL invalida"
    action: "Substituir por placeholder visual com instrucao para o usuario inserir a imagem correta"
---

# Tarefa: Gerar HTML Autocontido

## Contexto

O HTML autocontido e a saida primaria de todo o pipeline de geracao. Um unico arquivo
que funciona ao ser aberto em qualquer navegador, sem dependencias externas alem de
fontes do Google Fonts. E o artefato que o usuario recebe e pode implantar imediatamente.

## Responsavel

**@dev-captain** com delegacao para **@html-builder-lieutenant**, **@css-specialist-sergeant**
e **@performance-sergeant**

## Requisitos Tecnicos

1. HTML5 valido e semantico
2. CSS totalmente contido no arquivo (tag <style> ou inline)
3. Responsivo com 3 breakpoints (360, 768, 1440 pixels)
4. Tamanho maximo recomendado: 200 kilobytes
5. Zero dependencias de JavaScript para funcionalidade essencial
6. JavaScript opcional apenas para: acordeoes de FAQ, contadores regressivos, animacoes suaves
