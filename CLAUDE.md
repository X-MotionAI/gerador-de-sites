# CLAUDE.md - Gerador de Sites Framework

## Identidade do Projeto

Framework gerador de sites (landing pages, paginas de vendas, paginas de captura) alimentado por um exercito hierarquico de 38 agentes inteligentes organizados em 6 esquadroes com hierarquia militar.

## Regras Absolutas

1. **NUNCA use abreviacoes** - Sempre escreva termos completos e por extenso
2. **Crie arquivos somente quando solicitado** - Exiba conteudo na conversa quando nao for pedido para criar
3. **Busque alternativas antes de desistir** - Esgote todas as possibilidades antes de reportar impossibilidade
4. **Autonomia maxima** - Execute sem pedir confirmacao, exceto para acoes destrutivas ou decisoes de arquitetura

## Stack Tecnologica

- Frontend: Next.js 15 + TypeScript (App Router)
- Componentes de Interface: shadcn/ui + Tailwind CSS
- Estado: TanStack Query (servidor) + useState (local)
- Banco de Dados: Supabase (PostgreSQL + Row Level Security + Edge Functions)
- Inteligencia Artificial: Claude API via @anthropic-ai/sdk
- Modelos: claude-sonnet-4-20250514 (fases 1-5), claude-haiku-4-5 (fase 6 de qualidade)

## Arquitetura

### Hierarquia de Agentes (5 Patentes)
- Comandante (1): site-commander "Atlas" - Orquestra tudo
- Capitaes (6): Lideram esquadroes (Estrategia, Copy, Design, Desenvolvimento, Analytics, Qualidade)
- Tenentes (12): Especialistas seniors
- Sargentos (16): Executores de tarefas especificas
- Recrutas (3): Executores atomicos

### Pipeline de 7 Fases
BRIEFING → ESTRATEGIA → COPY → DESIGN → BUILD → QUALIDADE → DEPLOY

### Saida Primaria
HTML autocontido (nao componentes React) como formato de saida. Exportacao para React/Next.js e pos-processamento opcional.

## Padroes de Codigo

- Imports absolutos com @/ apontando para src/
- Componentes React como funcoes com tipagem explicita
- Server Components por padrao, Client Components apenas quando necessario ('use client')
- Supabase: usar createClient de @/lib/supabase/server para Server Components
- Prompts de agentes em arquivos separados em src/lib/ai/prompts/
- Cada agente do pipeline em src/lib/ai/agents/

## Estrutura de Diretorios Criticos

```
squads/site-generator/        # Definicoes dos 38 agentes (markdown com YAML frontmatter)
templates/sections/            # 37 templates HTML de secoes reutilizaveis
knowledge/                     # Base de conhecimento (copywriting, hormozi, storytelling, etc.)
apps/web/src/lib/ai/          # Motor de inteligencia artificial (cliente Claude, orquestrador, agentes)
supabase/migrations/          # Esquema do banco de dados
```

## Configuracao em 3 Camadas
1. Framework defaults (squads/site-generator/config/config.yaml) - Imutavel
2. Project overrides (artefatos do pipeline por projeto) - Por projeto
3. User preferences (perfil do usuario) - Global do usuario
