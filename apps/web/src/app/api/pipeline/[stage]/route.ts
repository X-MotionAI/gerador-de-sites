// ---------------------------------------------------------------------------
// route.ts — Dynamic API route for pipeline stage execution
// ---------------------------------------------------------------------------
// POST /api/pipeline/briefing   — executes the briefing stage
// POST /api/pipeline/strategy   — executes the strategy stage
// POST /api/pipeline/copy       — executes the copywriting stage
// POST /api/pipeline/design     — executes the design stage
// POST /api/pipeline/build      — executes the build stage
// POST /api/pipeline/qa         — executes the quality assurance stage
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { executeBriefing } from '@/lib/ai/agents/briefing-agent';
import { executeStrategy } from '@/lib/ai/agents/strategist-agent';
import { executeCopywriting } from '@/lib/ai/agents/copywriter-agent';
import { executeDesign } from '@/lib/ai/agents/designer-agent';
import { executeBuild } from '@/lib/ai/agents/builder-agent';
import { executeQA } from '@/lib/ai/agents/qa-agent';
import type {
  PipelineStage,
  BriefingOutput,
  StrategyOutput,
  CopyOutput,
  DesignOutput,
} from '@/lib/ai/types';

// ---------------------------------------------------------------------------
// Supported stages
// ---------------------------------------------------------------------------

const VALID_STAGES: PipelineStage[] = [
  'briefing',
  'strategy',
  'copy',
  'design',
  'build',
  'qa',
];

// ---------------------------------------------------------------------------
// Type guard for request body validation
// ---------------------------------------------------------------------------

function hasRequiredFields(body: Record<string, unknown>, fields: string[]): string[] {
  const missing: string[] = [];
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null) {
      missing.push(field);
    }
  }
  return missing;
}

// ---------------------------------------------------------------------------
// Stage execution dispatcher
// ---------------------------------------------------------------------------

async function executeStage(
  stage: PipelineStage,
  body: Record<string, unknown>
): Promise<{ data: unknown; error: string | null }> {
  switch (stage) {
    // ---- Briefing ----
    case 'briefing': {
      const missingFields = hasRequiredFields(body, ['userInput']);
      if (missingFields.length > 0) {
        return {
          data: null,
          error: `Campos obrigatorios ausentes para o estagio "briefing": ${missingFields.join(', ')}. O campo "userInput" deve conter a descricao do projeto fornecida pelo usuario.`,
        };
      }
      const result = await executeBriefing(body.userInput as string);
      return { data: result, error: null };
    }

    // ---- Strategy ----
    case 'strategy': {
      const missingFields = hasRequiredFields(body, ['briefing']);
      if (missingFields.length > 0) {
        return {
          data: null,
          error: `Campos obrigatorios ausentes para o estagio "strategy": ${missingFields.join(', ')}. O campo "briefing" deve conter a saida completa do estagio de briefing.`,
        };
      }
      const result = await executeStrategy(body.briefing as BriefingOutput);
      return { data: result, error: null };
    }

    // ---- Copywriting ----
    case 'copy': {
      const missingFields = hasRequiredFields(body, ['briefing', 'strategy']);
      if (missingFields.length > 0) {
        return {
          data: null,
          error: `Campos obrigatorios ausentes para o estagio "copy": ${missingFields.join(', ')}. Os campos "briefing" e "strategy" sao necessarios.`,
        };
      }
      const result = await executeCopywriting(
        body.briefing as BriefingOutput,
        body.strategy as StrategyOutput
      );
      return { data: result, error: null };
    }

    // ---- Design ----
    case 'design': {
      const missingFields = hasRequiredFields(body, ['briefing', 'strategy']);
      if (missingFields.length > 0) {
        return {
          data: null,
          error: `Campos obrigatorios ausentes para o estagio "design": ${missingFields.join(', ')}. Os campos "briefing" e "strategy" sao necessarios.`,
        };
      }
      const result = await executeDesign(
        body.briefing as BriefingOutput,
        body.strategy as StrategyOutput
      );
      return { data: result, error: null };
    }

    // ---- Build ----
    case 'build': {
      const missingFields = hasRequiredFields(body, ['briefing', 'strategy', 'copy', 'design']);
      if (missingFields.length > 0) {
        return {
          data: null,
          error: `Campos obrigatorios ausentes para o estagio "build": ${missingFields.join(', ')}. Os campos "briefing", "strategy", "copy" e "design" sao todos necessarios.`,
        };
      }
      const result = await executeBuild(
        body.briefing as BriefingOutput,
        body.strategy as StrategyOutput,
        body.copy as CopyOutput,
        body.design as DesignOutput
      );
      return { data: result, error: null };
    }

    // ---- Quality Assurance ----
    case 'qa': {
      const missingFields = hasRequiredFields(body, ['html', 'briefing', 'strategy']);
      if (missingFields.length > 0) {
        return {
          data: null,
          error: `Campos obrigatorios ausentes para o estagio "qa": ${missingFields.join(', ')}. Os campos "html" (string com o HTML gerado), "briefing" e "strategy" sao necessarios.`,
        };
      }
      const result = await executeQA(
        body.html as string,
        body.briefing as BriefingOutput,
        body.strategy as StrategyOutput
      );
      return { data: result, error: null };
    }

    default:
      return {
        data: null,
        error: `O estagio "${stage}" nao e suportado por esta rota de API.`,
      };
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ stage: string }> }
): Promise<NextResponse> {
  const resolvedParams = await params;
  const stage = resolvedParams.stage as PipelineStage;

  // Validate that the stage is a known pipeline stage
  if (!VALID_STAGES.includes(stage)) {
    return NextResponse.json(
      {
        success: false,
        error: `Estagio invalido: "${stage}". Estagios validos: ${VALID_STAGES.join(', ')}`,
        data: null,
      },
      { status: 400 }
    );
  }

  // Parse the request body
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'O corpo da requisicao deve ser um JSON valido.',
        data: null,
      },
      { status: 400 }
    );
  }

  // Execute the corresponding stage
  try {
    const startTime = Date.now();
    const { data, error } = await executeStage(stage, body);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error,
          data: null,
        },
        { status: 422 }
      );
    }

    const durationMilliseconds = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        stage,
        data,
        meta: {
          durationMilliseconds,
          executedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[Pipeline API] Erro ao executar o estagio "${stage}":`, error);

    // Determine the appropriate status code based on the error type
    const isValidationError =
      error instanceof Error &&
      error.message.includes('validacao');

    const statusCode = isValidationError ? 422 : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error
          ? error.message
          : 'Ocorreu um erro interno inesperado durante a execucao do estagio.',
        data: null,
        stage,
      },
      { status: statusCode }
    );
  }
}
