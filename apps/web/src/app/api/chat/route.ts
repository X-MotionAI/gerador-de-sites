// ---------------------------------------------------------------------------
// route.ts — Streaming chat API for interactive briefing conversations
// ---------------------------------------------------------------------------
// POST /api/chat
// Receives: { message, projectId, stage, history }
// Streams Claude's response back using ReadableStream with Server-Sent Events
// ---------------------------------------------------------------------------

import { NextRequest } from 'next/server';
import { getClaudeClient } from '@/lib/ai/claude-client';
import { buildBriefingPrompt } from '@/lib/ai/prompts/briefing-prompt';
import type { PipelineStage } from '@/lib/ai/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  message: string;
  projectId: string;
  stage: string;
  history: ChatMessage[];
}

// ---------------------------------------------------------------------------
// Stage-specific conversational prompts
// ---------------------------------------------------------------------------

const STAGE_PROMPTS: Record<string, string> = {
  briefing: buildBriefingPrompt(),

  strategy: `Voce e um estrategista de marketing digital e especialista em ofertas irresistiveis.
Seu papel e ajudar o usuario a definir o posicionamento, a proposta de valor e a estrutura da oferta para o site.
Use os frameworks de Alex Hormozi (Value Equation, Grand Slam Offer), posicionamento de Al Ries,
e os 5 niveis de consciencia de Eugene Schwartz para guiar a conversa.
Faca perguntas inteligentes e proponha estrategias baseadas nas respostas do usuario.`,

  copy: `Voce e um diretor de copy com expertise nos maiores mestres do copywriting mundial.
Seu papel e ajudar o usuario a refinar e melhorar o copy gerado para cada secao do site.
Conhece profundamente os frameworks de Gary Halbert, Eugene Schwartz, David Ogilvy, Joe Sugarman,
Dan Kennedy, Russell Brunson e Alex Hormozi.
Ofereca sugestoes especificas para melhorar headlines, corpo do texto, chamadas para acao e FAQ.`,

  design: `Voce e um diretor de design especializado em criar paginas de alta conversao.
Seu papel e ajudar o usuario a refinar as escolhas de design: layout, cores, tipografia, espacamento e componentes.
Conhece profundamente Atomic Design (Brad Frost), design systems (Dan Mall), e design tokens.
Sugira melhorias visuais e de experiencia do usuario baseadas nas melhores praticas de conversao.`,

  build: `Voce e um arquiteto de frontend especializado em Next.js, React, TypeScript e Tailwind CSS.
Seu papel e ajudar o usuario com questoes tecnicas sobre o codigo gerado, customizacoes e otimizacoes.
Pode sugerir melhorias de performance, acessibilidade e SEO no codigo HTML/CSS gerado.`,

  qa: `Voce e um revisor de qualidade especializado em sites de alta conversao.
Seu papel e ajudar o usuario a entender os resultados da revisao de qualidade,
explicar problemas encontrados e sugerir correcoes especificas.
Avalia copy, design, codigo, acessibilidade, SEO e compliance.`,

  deploy: `Voce e um especialista em deploy e publicacao de sites.
Seu papel e ajudar o usuario com a publicacao do site gerado,
incluindo configuracao de dominio, SSL, Vercel, e otimizacao de producao.`,
};

function getSystemPromptForStage(stage: PipelineStage): string {
  const basePrompt = STAGE_PROMPTS[stage] || STAGE_PROMPTS.briefing;

  return `${basePrompt}

---

MODO CONVERSACIONAL ATIVO:
Voce esta em uma conversa interativa com o usuario durante o pipeline de geracao de sites.

Regras adicionais para o modo conversacional:
1. Responda de forma natural e amigavel, como um especialista experiente conversando com um cliente.
2. Se o usuario fornecer informacoes incompletas, faca perguntas direcionadas para obter os dados faltantes.
3. Resuma o que voce entendeu e peca confirmacao antes de prosseguir.
4. Quando tiver informacoes suficientes, avise o usuario que o estagio pode ser executado.
5. Mantenha o contexto da conversa anterior ao responder.
6. Use linguagem acessivel, evitando jargao tecnico desnecessario.
7. Seja proativo: sugira melhorias e alternativas quando apropriado.`;
}

// ---------------------------------------------------------------------------
// Request body validation
// ---------------------------------------------------------------------------

function validateChatRequest(body: unknown): { valid: true; data: ChatRequestBody } | { valid: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { valid: false, error: 'O corpo da requisicao deve ser um objeto JSON.' };
  }

  const typedBody = body as Record<string, unknown>;

  if (typeof typedBody.message !== 'string' || typedBody.message.trim().length === 0) {
    return { valid: false, error: 'O campo "message" e obrigatorio e deve ser uma string nao vazia.' };
  }

  if (typeof typedBody.projectId !== 'string' || typedBody.projectId.trim().length === 0) {
    return { valid: false, error: 'O campo "projectId" e obrigatorio e deve ser uma string nao vazia.' };
  }

  if (typeof typedBody.stage !== 'string' || typedBody.stage.trim().length === 0) {
    return { valid: false, error: 'O campo "stage" e obrigatorio e deve ser uma string nao vazia.' };
  }

  const history = Array.isArray(typedBody.history) ? typedBody.history : [];

  for (let index = 0; index < history.length; index++) {
    const historyMessage = history[index] as Record<string, unknown>;
    if (typeof historyMessage.role !== 'string' || typeof historyMessage.content !== 'string') {
      return {
        valid: false,
        error: `Mensagem no historico no indice ${index} deve ter "role" (string) e "content" (string).`,
      };
    }
    if (historyMessage.role !== 'user' && historyMessage.role !== 'assistant') {
      return {
        valid: false,
        error: `Mensagem no historico no indice ${index}: "role" deve ser "user" ou "assistant".`,
      };
    }
  }

  return {
    valid: true,
    data: {
      message: typedBody.message as string,
      projectId: typedBody.projectId as string,
      stage: typedBody.stage as string,
      history: history as ChatMessage[],
    },
  };
}

// ---------------------------------------------------------------------------
// Server-Sent Events encoder
// ---------------------------------------------------------------------------

function encodeServerSentEvent(eventType: string, data: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(`event: ${eventType}\ndata: ${data}\n\n`);
}

// ---------------------------------------------------------------------------
// POST handler — streams Claude's response
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<Response> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'O corpo da requisicao deve ser um JSON valido.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const validation = validateChatRequest(rawBody);
  if (!validation.valid) {
    return new Response(
      JSON.stringify({ success: false, error: validation.error }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { message, projectId, stage, history } = validation.data;
  const systemPrompt = getSystemPromptForStage(stage as PipelineStage);

  const historyContext = history.length > 0
    ? `\n\n---\nHISTORICO DA CONVERSA (projeto ${projectId}):\n${history
        .map((m) => `[${m.role === 'user' ? 'USUARIO' : 'ASSISTENTE'}]: ${m.content}`)
        .join('\n')}\n---\n`
    : '';

  const fullSystemPrompt = systemPrompt + historyContext;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const client = getClaudeClient();

        controller.enqueue(
          encodeServerSentEvent('start', JSON.stringify({ stage, projectId }))
        );

        const tokenStream = client.stream({
          systemPrompt: fullSystemPrompt,
          userMessage: message,
          temperature: 0.7,
          maxTokens: 4096,
        });

        for await (const chunk of tokenStream) {
          controller.enqueue(
            encodeServerSentEvent('token', JSON.stringify({ content: chunk }))
          );
        }

        controller.enqueue(
          encodeServerSentEvent('done', JSON.stringify({ finished: true }))
        );
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Ocorreu um erro interno inesperado durante o streaming da resposta.';

        controller.enqueue(
          encodeServerSentEvent('error', JSON.stringify({ error: errorMessage }))
        );

        console.error(`[Chat API] Erro de streaming (projeto ${projectId}, estagio ${stage}):`, error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
