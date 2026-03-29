// ---------------------------------------------------------------------------
// strategist-agent.ts — Generates marketing strategy from briefing data
// ---------------------------------------------------------------------------

import { getClaudeClient } from '../claude-client';
import { buildStrategyPrompt } from '../prompts/strategy-prompt';
import type { BriefingOutput, StrategyOutput, AgentInvocation, AwarenessLevel } from '../types';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const VALID_AWARENESS_LEVELS: AwarenessLevel[] = [
  'unaware',
  'problem-aware',
  'solution-aware',
  'product-aware',
  'most-aware',
];

const VALID_FORMALITY_VALUES = ['casual', 'balanced', 'formal'] as const;
const VALID_INTENSITY_VALUES = ['low', 'medium', 'high'] as const;

function validateStrategyOutput(data: Record<string, unknown>): StrategyOutput {
  const errors: string[] = [];

  // Validate awareness level
  if (!VALID_AWARENESS_LEVELS.includes(data.awarenessLevel as AwarenessLevel)) {
    errors.push(
      `"awarenessLevel" deve ser um dos seguintes valores: ${VALID_AWARENESS_LEVELS.join(', ')}. Valor recebido: "${data.awarenessLevel}"`
    );
  }

  // Validate required string fields
  const requiredStringFields = ['positioningStatement', 'persuasionSequence', 'recommendedPageStructure'];
  for (const field of requiredStringFields) {
    if (typeof data[field] !== 'string' || (data[field] as string).trim().length === 0) {
      errors.push(`O campo "${field}" e obrigatorio e deve ser uma string nao vazia.`);
    }
  }

  // Validate required array fields
  const requiredArrayFields = ['valueStack', 'emotionalDrivers', 'rationalDrivers', 'objectionsToAddress', 'sections'];
  for (const field of requiredArrayFields) {
    if (!Array.isArray(data[field]) || (data[field] as unknown[]).length === 0) {
      errors.push(`O campo "${field}" e obrigatorio e deve ser um array com pelo menos um item.`);
    }
  }

  // Validate sections have required structure
  if (Array.isArray(data.sections)) {
    for (let index = 0; index < (data.sections as unknown[]).length; index++) {
      const section = (data.sections as Record<string, unknown>[])[index];
      if (!section.id || !section.sectionType || typeof section.order !== 'number') {
        errors.push(`A secao no indice ${index} esta incompleta. Campos obrigatorios: id, sectionType, order.`);
      }
    }
  }

  // Validate keyMessages object
  if (typeof data.keyMessages !== 'object' || data.keyMessages === null) {
    errors.push('O campo "keyMessages" e obrigatorio e deve ser um objeto.');
  } else {
    const keyMessages = data.keyMessages as Record<string, unknown>;
    if (typeof keyMessages.primary !== 'string' || typeof keyMessages.secondary !== 'string') {
      errors.push('Os campos "keyMessages.primary" e "keyMessages.secondary" sao obrigatorios.');
    }
    if (!Array.isArray(keyMessages.supporting)) {
      errors.push('O campo "keyMessages.supporting" deve ser um array de strings.');
    }
  }

  // Validate toneGuidelines object
  if (typeof data.toneGuidelines !== 'object' || data.toneGuidelines === null) {
    errors.push('O campo "toneGuidelines" e obrigatorio e deve ser um objeto.');
  } else {
    const tone = data.toneGuidelines as Record<string, unknown>;
    if (typeof tone.voice !== 'string') {
      errors.push('O campo "toneGuidelines.voice" e obrigatorio.');
    }
    if (!VALID_FORMALITY_VALUES.includes(tone.formality as typeof VALID_FORMALITY_VALUES[number])) {
      errors.push(`"toneGuidelines.formality" deve ser: ${VALID_FORMALITY_VALUES.join(', ')}`);
    }
    if (!VALID_INTENSITY_VALUES.includes(tone.emotionalIntensity as typeof VALID_INTENSITY_VALUES[number])) {
      errors.push(`"toneGuidelines.emotionalIntensity" deve ser: ${VALID_INTENSITY_VALUES.join(', ')}`);
    }
  }

  // Validate valueStack items structure
  if (Array.isArray(data.valueStack)) {
    for (let index = 0; index < (data.valueStack as unknown[]).length; index++) {
      const item = (data.valueStack as Record<string, unknown>[])[index];
      if (typeof item.name !== 'string' || typeof item.description !== 'string') {
        errors.push(`O item do value stack no indice ${index} precisa ter "name" e "description" como strings.`);
      }
    }
  }

  if (errors.length > 0) {
    throw new StrategyAgentError(
      `A estrategia retornada pelo Claude falhou na validacao:\n- ${errors.join('\n- ')}`,
      'VALIDATION_FAILED'
    );
  }

  return data as unknown as StrategyOutput;
}

// ---------------------------------------------------------------------------
// Apply safe defaults for optional fields within nested objects
// ---------------------------------------------------------------------------

function applyDefaults(data: Record<string, unknown>): Record<string, unknown> {
  // Ensure valueStack items have all fields
  if (Array.isArray(data.valueStack)) {
    data.valueStack = (data.valueStack as Record<string, unknown>[]).map((item, index) => ({
      name: item.name ?? '',
      description: item.description ?? '',
      perceivedValue: item.perceivedValue ?? '',
      actualPrice: item.actualPrice ?? null,
      order: typeof item.order === 'number' ? item.order : index + 1,
    }));
  }

  // Ensure sections have all required SectionConfig fields
  if (Array.isArray(data.sections)) {
    data.sections = (data.sections as Record<string, unknown>[]).map((section, index) => ({
      id: section.id ?? `section-${index + 1}`,
      name: section.name ?? '',
      sectionType: section.sectionType ?? 'custom',
      order: typeof section.order === 'number' ? section.order : index + 1,
      required: typeof section.required === 'boolean' ? section.required : true,
      description: section.description ?? '',
    }));
  }

  // Ensure toneGuidelines.examples is an array
  if (typeof data.toneGuidelines === 'object' && data.toneGuidelines !== null) {
    const tone = data.toneGuidelines as Record<string, unknown>;
    if (!Array.isArray(tone.examples)) {
      tone.examples = [];
    }
  }

  // Ensure keyMessages.supporting is an array
  if (typeof data.keyMessages === 'object' && data.keyMessages !== null) {
    const keyMessages = data.keyMessages as Record<string, unknown>;
    if (!Array.isArray(keyMessages.supporting)) {
      keyMessages.supporting = [];
    }
  }

  return data;
}

// ---------------------------------------------------------------------------
// Main execution function
// ---------------------------------------------------------------------------

export async function executeStrategy(briefing: BriefingOutput): Promise<StrategyOutput> {
  const client = getClaudeClient();

  // Step 1: Build the strategy prompt with the briefing data injected
  const systemPrompt = buildStrategyPrompt(briefing);

  // Step 2: Prepare the invocation with the briefing as the user message
  const invocation: AgentInvocation = {
    systemPrompt,
    userMessage: JSON.stringify(briefing, null, 2),
    temperature: 0.6,
    maxTokens: 6144,
  };

  // Step 3: Call Claude and parse the JSON response
  const rawData = await client.invokeAndParseJson<Record<string, unknown>>(invocation);

  // Step 4: Apply safe defaults
  const dataWithDefaults = applyDefaults(rawData);

  // Step 5: Validate the strategy output
  const validatedStrategy = validateStrategyOutput(dataWithDefaults);

  return validatedStrategy;
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export type StrategyAgentErrorCode = 'VALIDATION_FAILED' | 'EXECUTION_FAILED';

export class StrategyAgentError extends Error {
  public readonly code: StrategyAgentErrorCode;

  constructor(message: string, code: StrategyAgentErrorCode) {
    super(message);
    this.name = 'StrategyAgentError';
    this.code = code;
    Object.setPrototypeOf(this, StrategyAgentError.prototype);
  }
}
