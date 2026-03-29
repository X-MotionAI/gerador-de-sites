---
checklist:
  id: design-quality
  name: "Checklist de Qualidade de Design"
  version: "1.0"
  used_by:
    - design-reviewer
    - qa-captain
  severity_levels:
    critical: "Bloqueia entrega — deve ser corrigido antes da publicacao"
    non_critical: "Recomendacao de melhoria — nao bloqueia entrega mas deve ser documentado"
---

# Checklist de Qualidade de Design

## Itens Criticos (Bloqueiam Entrega)

### Acessibilidade de Contraste
- [ ] **Contraste de texto normal**: Todas as combinacoes de texto normal (menor que 18 pontos) e fundo possuem ratio de contraste minimo de 4.5:1 segundo as Web Content Accessibility Guidelines 2.1 nivel AA
- [ ] **Contraste de texto grande**: Todas as combinacoes de texto grande (18 pontos ou maior, ou 14 pontos em negrito ou maior) e fundo possuem ratio de contraste minimo de 3:1
- [ ] **Contraste de elementos interativos**: Bordas de campos de formulario, icones funcionais e indicadores de estado possuem ratio de contraste minimo de 3:1 contra o fundo
- [ ] **Texto sobre imagens**: Todo texto sobreposto a imagens de fundo possui overlay, sombra ou caixa de fundo garantindo contraste minimo em 100% da area do texto
- [ ] **Indicador de foco visivel**: Todos os elementos interativos possuem indicador de foco visivel com contraste adequado quando navegados por teclado

### Responsividade Mobile
- [ ] **Layout mobile funcional (375 pixels)**: A pagina e completamente funcional e legivel em tela de 375 pixels de largura (iPhone padrao)
- [ ] **Layout mobile minimo (320 pixels)**: A pagina nao apresenta scroll horizontal ou conteudo cortado em tela de 320 pixels de largura
- [ ] **Layout tablet funcional (768 pixels)**: A pagina adapta-se corretamente para tela de 768 pixels de largura
- [ ] **Layout desktop funcional (1280 pixels)**: A pagina e completamente funcional em tela de 1280 pixels de largura
- [ ] **Sem scroll horizontal**: Nenhum breakpoint apresenta scroll horizontal indesejado
- [ ] **Texto legivel sem zoom**: Corpo de texto possui tamanho minimo de 16 pixels em dispositivos moveis
- [ ] **Imagens responsivas**: Imagens redimensionam proporcionalmente sem corte de conteudo importante e sem distorcao
- [ ] **Formularios usaveis em mobile**: Campos de formulario sao preenchíveis com teclado virtual sem sobreposicao

### Alvos de Toque
- [ ] **Dimensao minima de alvos de toque**: Todos os elementos tocaveis (botoes, links, campos, checkboxes, radio buttons) possuem area minima de 44 por 44 pixels em dispositivos moveis
- [ ] **Espacamento entre alvos**: Espacamento minimo de 8 pixels entre alvos de toque adjacentes para evitar toques acidentais
- [ ] **Chamada para acao principal tocavel**: O botao principal de chamada para acao possui dimensao generosa (minimo 48 por 48 pixels) e area de toque confortavel

### Hierarquia Visual
- [ ] **Titulo H1 proeminente**: O titulo principal (H1) e visualmente o elemento mais proeminente e e lido primeiro
- [ ] **Chamada para acao destacada**: A chamada para acao principal se destaca visualmente do restante da pagina por cor, tamanho e contraste
- [ ] **Sem competicao visual**: Nenhuma secao possui multiplos elementos competindo pela atencao simultaneamente
- [ ] **Progressao de headings**: Niveis tipograficos criam hierarquia visual clara (H1 maior que H2 maior que H3 maior que corpo de texto)

### Integridade Visual
- [ ] **Zero imagens quebradas**: Todas as imagens carregam corretamente em todos os breakpoints
- [ ] **Zero elementos sobrepostos indevidamente**: Nenhum elemento de texto ou interativo esta sobreposto a outro de forma que prejudique leitura ou uso
- [ ] **Zero overflow de conteudo**: Nenhum texto ou elemento transborda seu container de forma indevida

## Itens Nao Criticos (Recomendacoes)

### Consistencia de Marca
- [ ] **Logotipo correto**: Logotipo utilizado na versao correta (formato, proporcao, espaco de respiro) conforme diretrizes da marca
- [ ] **Cores da marca**: Cores institucionais aplicadas nos elementos corretos conforme guia de marca do cliente
- [ ] **Tipografia da marca**: Fontes da marca utilizadas ou alternativa adequada documentada e justificada
- [ ] **Tom visual consistente**: Estilo de fotografia, ilustracao e iconografia e uniforme ao longo da pagina

### Design Tokens
- [ ] **Cores via tokens**: 100% das cores utilizadas referenciam tokens do sistema de design, sem valores hexadecimais hardcoded
- [ ] **Tipografia via tokens**: Todos os tamanhos de fonte, pesos e alturas de linha referenciam a escala tipografica definida nos tokens
- [ ] **Espacamento via tokens**: Todos os paddings, margins e gaps referenciam a escala de espacamento dos tokens (4, 8, 12, 16, 24, 32, 48, 64, 96 pixels)
- [ ] **Bordas via tokens**: Raios de borda seguem a escala definida nos tokens
- [ ] **Sombras via tokens**: Sombras seguem os niveis definidos nos tokens (nenhuma, sutil, media, pronunciada, elevada)

### Espacamento e Alinhamento
- [ ] **Espacamento entre secoes uniforme**: O espacamento vertical entre secoes e consistente ao longo de toda a pagina
- [ ] **Espacamento interno consistente**: Padding interno das secoes segue padrao uniforme
- [ ] **Alinhamento em grade**: Elementos estao alinhados a uma grade implicita ou explicita consistente
- [ ] **Espacamento de lista uniforme**: Itens em listas, cards e grids possuem espacamento identico entre si
- [ ] **Margens laterais consistentes**: Margens laterais do conteudo sao identicas ao longo de toda a pagina

### Qualidade Visual
- [ ] **Imagens de alta qualidade**: Imagens sao nitidas, sem pixelizacao, e com resolucao adequada para telas de alta densidade (retina)
- [ ] **Proporcao de imagens**: Imagens mantem proporcao original sem distorcao (sem stretch)
- [ ] **Icones consistentes**: Icones seguem o mesmo estilo visual (outline, solid, tamanho, espessura de traço)
- [ ] **Animacoes suaves**: Transicoes e animacoes sao suaves (minimo 60 quadros por segundo) e nao causam desorientacao
- [ ] **Estados de hover**: Elementos interativos possuem estado visual de hover que indica interatividade
- [ ] **Estados de carregamento**: Formularios e botoes possuem estado visual de carregamento (loading) durante processamento

### Experiencia do Usuario
- [ ] **Acima da dobra efetivo**: O conteudo visivel sem scroll (acima da dobra) comunica a proposta de valor e contem pelo menos uma chamada para acao
- [ ] **Fluxo visual natural**: O olhar do usuario e guiado naturalmente pelo layout na ordem desejada (esquerda para direita, cima para baixo, seguindo padrao F ou Z)
- [ ] **Espaco em branco adequado**: Existe espaco em branco suficiente para que o conteudo respire e nao cause sensacao de sobrecarga visual
- [ ] **Contraste entre secoes**: Secoes alternadas possuem diferenciacao visual suficiente (cor de fundo alternada, separadores visuais) para criar ritmo
