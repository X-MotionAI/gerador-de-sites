// ---------------------------------------------------------------------------
// qa-agent.ts — Reviews generated HTML against briefing and strategy criteria
// ---------------------------------------------------------------------------

import { getClaudeClient } from '../claude-client';
import { buildQAPrompt } from '../prompts/qa-prompt';
import type {
  BriefingOutput,
  StrategyOutput,
  QAOutput,
  QAIssue,
  AgentInvocation,
} from '../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HAIKU_MODEL = 'claude-3-5-haiku-20241022';

const VALID_VERDICTS = ['approved', 'needs-fixes', 'rejected'] as const;

const VALID_SEVERITIES = ['critical', 'major', 'minor', 'suggestion'] as const;

const VALID_CATEGORIES: QAIssue['category'][] = [
  'html-structure',
  'accessibility',
  'seo',
  'copy-quality',
  'design-consistency',
  'performance',
  'responsiveness',
  'conversion-optimization',
];

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateQAOutput(data: Record<string, unknown>): QAOutput {
  const errors: string[] = [];

  // Validate verdict
  if (!VALID_VERDICTS.includes(data.verdict as typeof VALID_VERDICTS[number])) {
    errors.push(
      `"verdict" deve ser um dos valores: ${VALID_VERDICTS.join(', ')}. Valor recebido: "${data.verdict}"`
    );
  }

  // Validate overallScore
  if (typeof data.overallScore !== 'number' || data.overallScore < 0 || data.overallScore > 100) {
    errors.push('"overallScore" deve ser um numero entre 0 e 100.');
  }

  // Validate issues array
  if (!Array.isArray(data.issues)) {
    errors.push('"issues" e obrigatorio e deve ser um array.');
  } else {
    for (let index = 0; index < (data.issues as unknown[]).length; index++) {
      const issue = (data.issues as Record<string, unknown>[])[index];

      if (!VALID_SEVERITIES.includes(issue.severity as typeof VALID_SEVERITIES[number])) {
        errors.push(
          `Issue no indice ${index}: "severity" deve ser um dos valores: ${VALID_SEVERITIES.join(', ')}`
        );
      }

      if (!VALID_CATEGORIES.includes(issue.category as QAIssue['category'])) {
        errors.push(
          `Issue no indice ${index}: "category" deve ser um dos valores: ${VALID_CATEGORIES.join(', ')}`
        );
      }

      if (typeof issue.description !== 'string' || (issue.description as string).trim().length === 0) {
        errors.push(`Issue no indice ${index}: "description" e obrigatorio.`);
      }

      if (typeof issue.location !== 'string') {
        errors.push(`Issue no indice ${index}: "location" e obrigatorio.`);
      }

      if (typeof issue.suggestedFix !== 'string') {
        errors.push(`Issue no indice ${index}: "suggestedFix" e obrigatorio.`);
      }
    }
  }

  // Validate categoryScores
  if (typeof data.categoryScores !== 'object' || data.categoryScores === null) {
    errors.push('"categoryScores" e obrigatorio e deve ser um objeto com scores por categoria.');
  }

  // Validate summary
  if (typeof data.summary !== 'string' || (data.summary as string).trim().length === 0) {
    errors.push('"summary" e obrigatorio e deve ser uma string nao vazia.');
  }

  if (errors.length > 0) {
    throw new QAAgentError(
      `A avaliacao de qualidade retornada pelo Claude falhou na validacao:\n- ${errors.join('\n- ')}`,
      'VALIDATION_FAILED'
    );
  }

  return data as unknown as QAOutput;
}

// ---------------------------------------------------------------------------
// Apply safe defaults
// ---------------------------------------------------------------------------

function applyDefaults(data: Record<string, unknown>): Record<string, unknown> {
  // Ensure issues have all required fields with defaults
  if (Array.isArray(data.issues)) {
    data.issues = (data.issues as Record<string, unknown>[]).map((issue) => ({
      severity: VALID_SEVERITIES.includes(issue.severity as typeof VALID_SEVERITIES[number])
        ? issue.severity
        : 'minor',
      category: VALID_CATEGORIES.includes(issue.category as QAIssue['category'])
        ? issue.category
        : 'html-structure',
      description: typeof issue.description === 'string' ? issue.description : '',
      location: typeof issue.location === 'string' ? issue.location : 'desconhecido',
      suggestedFix: typeof issue.suggestedFix === 'string' ? issue.suggestedFix : '',
    }));
  } else {
    data.issues = [];
  }

  // Ensure categoryScores has all categories
  if (typeof data.categoryScores !== 'object' || data.categoryScores === null) {
    const defaultScores: Record<string, number> = {};
    for (const category of VALID_CATEGORIES) {
      defaultScores[category] = 0;
    }
    data.categoryScores = defaultScores;
  } else {
    const scores = data.categoryScores as Record<string, number>;
    for (const category of VALID_CATEGORIES) {
      if (typeof scores[category] !== 'number') {
        scores[category] = 0;
      }
    }
  }

  // Set approvedAt based on verdict
  if (data.verdict === 'approved') {
    data.approvedAt = data.approvedAt ?? new Date().toISOString();
  } else {
    data.approvedAt = null;
  }

  // Clamp overallScore to valid range
  if (typeof data.overallScore === 'number') {
    data.overallScore = Math.max(0, Math.min(100, Math.round(data.overallScore)));
  } else {
    data.overallScore = 0;
  }

  return data;
}

// ---------------------------------------------------------------------------
// Main execution function
// ---------------------------------------------------------------------------

export async function executeQA(
  html: string,
  briefing: BriefingOutput,
  strategy: StrategyOutput
): Promise<QAOutput> {
  const client = getClaudeClient();

  // Step 1: Build the Quality Assurance prompt
  const systemPrompt = buildQAPrompt(html, briefing, strategy);

  // Step 2: Prepare the user message with HTML and original requirements
  const userMessage = JSON.stringify(
    {
      htmlToReview: html,
      originalRequirements: {
        projectName: briefing.projectName,
        businessName: briefing.businessName,
        targetAudience: briefing.targetAudience,
        mainOffer: briefing.mainOffer,
        callToActionText: briefing.callToActionText,
        callToActionUrl: briefing.callToActionUrl,
        pageType: briefing.pageType,
        uniqueSellingProposition: briefing.uniqueSellingProposition,
        guaranteeDescription: briefing.guaranteeDescription,
      },
      strategyContext: {
        awarenessLevel: strategy.awarenessLevel,
        sections: strategy.sections.map((sectionItem) => ({
          id: sectionItem.id,
          sectionType: sectionItem.sectionType,
          required: sectionItem.required,
        })),
        keyMessages: strategy.keyMessages,
        positioningStatement: strategy.positioningStatement,
      },
      evaluationCriteria: [
        'Estrutura HTML: DOCTYPE, head, body, tags semanticas, tags fechadas corretamente.',
        'Acessibilidade: lang="pt-BR", alt em imagens, contraste de cores, navegacao por teclado.',
        'SEO: title, meta description, Open Graph tags, heading hierarchy (h1 unico, h2, h3 sequenciais).',
        'Qualidade do copy: todos os textos do briefing estao presentes, sem placeholders ou texto lorem ipsum.',
        'Consistencia do design: cores, fontes e espacamentos seguem os design tokens.',
        'Performance: imagens otimizadas, CSS minimalista, sem JavaScript desnecessario.',
        'Responsividade: meta viewport presente, media queries para mobile/tablet/desktop.',
        'Otimizacao de conversao: CTA visivel e claro, hierarquia visual adequada, fluxo de leitura logico.',
      ],
      instructions: [
        'Avalie o HTML fornecido em TODAS as categorias listadas.',
        'Atribua uma nota de 0 a 100 para cada categoria.',
        'Liste TODOS os problemas encontrados com severidade, descricao e sugestao de correcao.',
        'Atribua um veredicto final: "approved" (score >= 80 e sem issues criticas), "needs-fixes" (score >= 50 ou issues nao criticas), "rejected" (score < 50 ou issues criticas graves).',
        'Escreva um resumo executivo da avaliacao.',
      ],
    },
    null,
    2
  );

  // Step 3: Call Claude using the Haiku model for cost efficiency
  //         Quality Assurance is a review task that does not require the most
  //         expensive model — Haiku is fast, cheap, and sufficient for structured evaluation.
  const invocation: AgentInvocation = {
    systemPrompt,
    userMessage,
    model: HAIKU_MODEL,
    temperature: 0.2, // Very low temperature for deterministic evaluation
    maxTokens: 8192,
  };

  const rawData = await client.invokeAndParseJson<Record<string, unknown>>(invocation);

  // Step 4: Apply safe defaults
  const dataWithDefaults = applyDefaults(rawData);

  // Step 5: Validate the Quality Assurance output
  const validatedQA = validateQAOutput(dataWithDefaults);

  return validatedQA;
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export type QAAgentErrorCode = 'VALIDATION_FAILED' | 'EXECUTION_FAILED';

export class QAAgentError extends Error {
  public readonly code: QAAgentErrorCode;

  constructor(message: string, code: QAAgentErrorCode) {
    super(message);
    this.name = 'QAAgentError';
    this.code = code;
    Object.setPrototypeOf(this, QAAgentError.prototype);
  }
}
