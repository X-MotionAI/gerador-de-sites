---
checklist:
  id: conversion-quality
  name: "Checklist de Qualidade de Conversao"
  version: "1.0"
  used_by:
    - conversion-optimizer
    - analytics-captain
    - qa-captain
  severity_levels:
    critical: "Bloqueia entrega — deve ser corrigido antes da publicacao"
    non_critical: "Recomendacao de melhoria — nao bloqueia entrega mas deve ser documentado"
---

# Checklist de Qualidade de Conversao

## Itens Criticos (Bloqueiam Entrega)

### Chamadas para Acao
- [ ] **Chamada para acao principal presente e funcional**: O botao principal de conversao existe, esta visivel e executa a acao esperada (envio de formulario, redirecionamento, abertura de WhatsApp)
- [ ] **Chamada para acao acima da dobra**: Pelo menos uma chamada para acao e visivel sem scroll na tela de desktop e mobile
- [ ] **Chamada para acao com texto orientado a acao**: O texto do botao comunica o beneficio de clicar com verbo no imperativo ou primeira pessoa ("Quero meu acesso", "Garantir minha vaga", "Comecar agora")
- [ ] **Chamada para acao visualmente destacada**: O botao de chamada para acao possui cor contrastante que se destaca do restante da pagina
- [ ] **Chamada para acao repetida**: A chamada para acao principal aparece em pelo menos 3 posicoes ao longo da pagina (apos headline, apos beneficios, apos prova social ou ao final)
- [ ] **Link de WhatsApp funcional**: Se a chamada para acao direciona para WhatsApp, o link abre o WhatsApp com numero correto e mensagem pre-preenchida contextualizada

### Formularios de Conversao
- [ ] **Formulario funcional**: O formulario envia dados corretamente e exibe confirmacao de envio ao usuario
- [ ] **Campos minimos**: O formulario coleta somente os dados estritamente necessarios (cada campo adicional reduz taxa de conversao)
- [ ] **Validacao de campos em tempo real**: Campos possuem validacao de formato (email valido, telefone valido) com feedback imediato ao usuario
- [ ] **Mensagem de sucesso clara**: Apos envio do formulario, o usuario recebe confirmacao clara do proximo passo ("Recebemos seus dados, voce recebera um email em ate 5 minutos")
- [ ] **Formulario visivel sem scroll excessivo**: O formulario de conversao e facilmente encontrado sem que o usuario precise procurar

### Proposta de Valor
- [ ] **Proposta de valor clara em 5 segundos**: Um visitante novo entende o que esta sendo oferecido, para quem e qual o beneficio principal em ate 5 segundos de leitura
- [ ] **Beneficio principal na headline**: O titulo principal comunica o beneficio primario, nao uma caracteristica tecnica
- [ ] **Diferencial explicito**: A pagina comunica por que esta oferta e diferente ou melhor que as alternativas disponiveis

### Prova Social
- [ ] **Elementos de prova social presentes**: Pelo menos 2 tipos de prova social estao presentes na pagina (depoimentos, numeros, logos, selos, avaliacoes, mencoes em midia)
- [ ] **Depoimentos com credibilidade**: Depoimentos incluem nome, contexto relevante e resultado especifico (nao apenas elogios genericos)
- [ ] **Prova social real**: Todos os elementos de prova social sao baseados em dados reais fornecidos pelo cliente — zero fabricacao

### Confianca e Seguranca
- [ ] **Garantia informada**: A politica de garantia ou reembolso esta claramente informada antes da chamada para acao de compra
- [ ] **Dados de contato visiveis**: Informacoes de contato do responsavel (email, telefone, endereco ou razao social) estao acessiveis na pagina
- [ ] **Selos de seguranca presentes**: Selos de seguranca relevantes estao visiveis proximo ao ponto de conversao (pagamento seguro, dados protegidos, certificacoes)

## Itens Nao Criticos (Recomendacoes)

### Otimizacao de Scroll
- [ ] **Conteudo de retencao em pontos de abandono**: Elementos de engajamento (prova social, beneficios visuais, depoimentos em video) estao posicionados nos pontos onde dados indicam maior abandono de scroll
- [ ] **Barra fixa de chamada para acao**: Barra fixa no topo ou rodape com chamada para acao principal aparece apos scroll de 25% da pagina
- [ ] **Indicador de progresso ou curiosidade**: Elementos visuais incentivam o usuario a continuar scrollando (setas, previews de proxima secao, contadores)
- [ ] **Secoes com tamanho adequado**: Cada secao tem tamanho suficiente para comunicar seu conteudo sem ser excessivamente longa

### Estrategia de Saida (Exit-Intent)
- [ ] **Modal de saida implementada**: Modal de exit-intent esta configurada para disparar quando o usuario move o cursor para fechar a aba (desktop)
- [ ] **Oferta de saida diferenciada**: A oferta apresentada no exit-intent e diferente e complementar a oferta principal (guia gratuito, diagnostico, desconto especifico)
- [ ] **Frequencia controlada**: O exit-intent aparece no maximo 1 vez por sessao e respeita cookie de supressao de 7 dias
- [ ] **Fechamento facil**: O modal possui botao de fechar proeminente e fecha ao clicar fora da area do modal

### Urgencia e Escassez
- [ ] **Urgencia genuina**: Se elementos de urgencia estao presentes (timers, contadores, prazos), sao baseados em escassez real e verificavel
- [ ] **Timer vinculado a evento real**: Se existe timer de contagem regressiva, esta vinculado a um prazo ou evento real (fim de promocao, inicio de turma, esgotamento de estoque)
- [ ] **Escassez verificavel**: Se existem indicadores de escassez ("Apenas 12 vagas restantes"), os numeros sao reais e atualizados
- [ ] **Sem manipulacao enganosa**: Nenhum timer reinicia ao recarregar a pagina, nenhum contador exibe numeros falsos, nenhuma escassez e fabricada

### Experiencia de Conversao
- [ ] **Velocidade de carregamento adequada**: A pagina carrega completamente em menos de 3 segundos para nao perder visitantes impacientes
- [ ] **Sem distracao na area de conversao**: A area proxima a chamada para acao e ao formulario esta livre de elementos que distraem ou competem pela atencao
- [ ] **Micro-copy de reducao de risco**: Texto de apoio proximo a chamada para acao reduz objecoes de ultima hora ("Sem cartao de credito", "Cancele quando quiser", "Suporte por WhatsApp")
- [ ] **Preco claro e transparente**: Se o preco e exibido, inclui todas as taxas e condicoes de parcelamento sem surpresas
- [ ] **Multiplas opcoes de contato**: Pelo menos 2 canais de contato estao disponiveis (WhatsApp, email, telefone, chat) para usuarios que preferem falar antes de comprar

### Rastreamento de Conversao
- [ ] **Eventos de conversao rastreados**: Todas as acoes de conversao (envio de formulario, clique em WhatsApp, compra) disparam eventos de rastreamento nos pixels configurados
- [ ] **Micro-conversoes rastreadas**: Interacoes intermediarias (scroll ate secao de preco, visualizacao de depoimentos, clique em perguntas frequentes) estao sendo rastreadas
- [ ] **Pagina de agradecimento ou evento de sucesso**: Apos conversao, uma pagina de agradecimento e exibida ou um evento de sucesso e disparado para confirmacao de rastreamento
- [ ] **Parametros de campanha preservados**: Parametros UTM e identificadores de campanha sao preservados ao longo da jornada de conversao

### Elementos de Engajamento
- [ ] **Botao flutuante de WhatsApp**: Botao de WhatsApp flutuante posicionado no canto inferior direito com mensagem pre-preenchida contextualizada
- [ ] **Notificacoes de prova social**: Se implementadas, notificacoes de compras ou cadastros recentes utilizam dados reais com frequencia controlada (maximo 1 a cada 30 segundos, maximo 5 por sessao)
- [ ] **Perguntas frequentes expandiveis**: Secao de perguntas frequentes presente com perguntas relevantes que tratam objecoes reais do publico-alvo
- [ ] **Video de vendas ou demonstracao**: Se presente, o video carrega de forma nao bloqueante e possui thumbnail atrativo com botao de play visivel
