// ---------------------------------------------------------------------------
// copywriter-agent.ts — Generates persuasive copy for every section
// ---------------------------------------------------------------------------

import { getClaudeClient } from '../claude-client';
import { buildCopyPrompt } from '../prompts/copy-prompt';
import type {
  BriefingOutput,
  StrategyOutput,
  CopyOutput,
  SectionCopy,
  AgentInvocation,
} from '../types';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateSectionCopy(section: Record<string, unknown>, index: number): string[] {
  const errors: string[] = [];

  if (typeof section.sectionId !== 'string' || section.sectionId.trim().length === 0) {
    errors.push(`Secao no indice ${index}: "sectionId" e obrigatorio e deve ser uma string nao vazia.`);
  }

  if (typeof section.sectionType !== 'string' || section.sectionType.trim().length === 0) {
    errors.push(`Secao no indice ${index}: "sectionType" e obrigatorio e deve ser uma string nao vazia.`);
  }

  if (typeof section.headline !== 'string' || section.headline.trim().length === 0) {
    errors.push(`Secao no indice ${index} ("${section.sectionId}"): "headline" e obrigatorio.`);
  }

  if (typeof section.bodyText !== 'string') {
    errors.push(`Secao no indice ${index} ("${section.sectionId}"): "bodyText" e obrigatorio.`);
  }

  if (!Array.isArray(section.bulletPoints)) {
    errors.push(`Secao no indice ${index} ("${section.sectionId}"): "bulletPoints" deve ser um array.`);
  }

  return errors;
}

function validateCopyOutput(data: Record<string, unknown>, strategy: StrategyOutput): CopyOutput {
  const errors: string[] = [];

  // Validate meta fields
  if (typeof data.metaTitle !== 'string' || data.metaTitle.trim().length === 0) {
    errors.push('"metaTitle" e obrigatorio e deve ser uma string nao vazia.');
  }

  if (typeof data.metaDescription !== 'string' || data.metaDescription.trim().length === 0) {
    errors.push('"metaDescription" e obrigatorio e deve ser uma string nao vazia.');
  }

  if (typeof data.ogTitle !== 'string' || data.ogTitle.trim().length === 0) {
    errors.push('"ogTitle" e obrigatorio e deve ser uma string nao vazia.');
  }

  if (typeof data.ogDescription !== 'string' || data.ogDescription.trim().length === 0) {
    errors.push('"ogDescription" e obrigatorio e deve ser uma string nao vazia.');
  }

  // Validate sections array
  if (!Array.isArray(data.sections)) {
    errors.push('"sections" e obrigatorio e deve ser um array de objetos SectionCopy.');
  } else {
    // Validate each individual section
    for (let index = 0; index < (data.sections as unknown[]).length; index++) {
      const sectionErrors = validateSectionCopy(
        (data.sections as Record<string, unknown>[])[index],
        index
      );
      errors.push(...sectionErrors);
    }

    // Verify that every section defined in the strategy has corresponding copy
    const copySectionIds = new Set(
      (data.sections as Record<string, unknown>[]).map((sectionItem) => sectionItem.sectionId)
    );

    const missingSections = strategy.sections
      .filter((strategySectionItem) => strategySectionItem.required)
      .filter((strategySectionItem) => !copySectionIds.has(strategySectionItem.id));

    if (missingSections.length > 0) {
      errors.push(
        `Secoes obrigatorias da estrategia sem copy correspondente: ${missingSections
          .map((sectionItem) => `"${sectionItem.id}" (${sectionItem.sectionType})`)
          .join(', ')}`
      );
    }
  }

  if (errors.length > 0) {
    throw new CopywriterAgentError(
      `O copy retornado pelo Claude falhou na validacao:\n- ${errors.join('\n- ')}`,
      'VALIDATION_FAILED'
    );
  }

  return data as unknown as CopyOutput;
}

// ---------------------------------------------------------------------------
// Apply safe defaults for optional fields within section copy
// ---------------------------------------------------------------------------

function applyDefaults(data: Record<string, unknown>): Record<string, unknown> {
  if (Array.isArray(data.sections)) {
    data.sections = (data.sections as Record<string, unknown>[]).map((section) => ({
      ...section,
      subheadline: section.subheadline ?? null,
      bodyText: section.bodyText ?? '',
      bulletPoints: Array.isArray(section.bulletPoints) ? section.bulletPoints : [],
      callToAction: section.callToAction ?? null,
      supportingText: section.supportingText ?? null,
      testimonials: Array.isArray(section.testimonials) ? section.testimonials : null,
      faqItems: Array.isArray(section.faqItems) ? section.faqItems : null,
      pricingDetails: typeof section.pricingDetails === 'object' ? section.pricingDetails : null,
    }));
  }

  return data;
}

// ---------------------------------------------------------------------------
// Main execution function
// ---------------------------------------------------------------------------

export async function executeCopywriting(
  briefing: BriefingOutput,
  strategy: StrategyOutput
): Promise<CopyOutput> {
  const client = getClaudeClient();

  // Step 1: Build the copywriting prompt with briefing and strategy data.
  //         The awareness-level routing is embedded within the prompt builder
  //         so the copy style adapts automatically to the audience awareness.
  const systemPrompt = buildCopyPrompt(briefing, strategy);

  // Step 2: Prepare the user message with all context needed for copy generation
  const userMessage = JSON.stringify(
    {
      briefing,
      strategy,
      instructions: [
        `O nivel de consciencia do publico e "${strategy.awarenessLevel}". Adapte o tom, a profundidade das explicacoes e a abordagem de persuasao de acordo.`,
        `A sequencia de persuasao recomendada e: ${strategy.persuasionSequence}`,
        `Gere copy para TODAS as ${strategy.sections.length} secoes listadas na estrategia.`,
        `Cada secao deve ter pelo menos headline e bodyText preenchidos.`,
        `Use o tom "${strategy.toneGuidelines.voice}" com formalidade "${strategy.toneGuidelines.formality}" e intensidade emocional "${strategy.toneGuidelines.emotionalIntensity}".`,
      ],
    },
    null,
    2
  );

  // Step 3: Call Claude with higher max tokens since copy generation produces longer outputs
  const invocation: AgentInvocation = {
    systemPrompt,
    userMessage,
    temperature: 0.7, // Slightly higher temperature for creative copywriting
    maxTokens: 12288, // Higher limit to accommodate all sections
  };

  const rawData = await client.invokeAndParseJson<Record<string, unknown>>(invocation);

  // Step 4: Apply safe defaults for optional fields
  const dataWithDefaults = applyDefaults(rawData);

  // Step 5: Validate that every required section from the strategy has copy
  validateCopyOutput(dataWithDefaults, strategy);

  return dataWithDefaults as unknown as CopyOutput;
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export type CopywriterAgentErrorCode = 'VALIDATION_FAILED' | 'EXECUTION_FAILED';

export class CopywriterAgentError extends Error {
  public readonly code: CopywriterAgentErrorCode;

  constructor(message: string, code: CopywriterAgentErrorCode) {
    super(message);
    this.name = 'CopywriterAgentError';
    this.code = code;
    Object.setPrototypeOf(this, CopywriterAgentError.prototype);
  }
}
