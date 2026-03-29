// ---------------------------------------------------------------------------
// briefing-agent.ts — Extracts structured briefing data from raw user input
// ---------------------------------------------------------------------------

import { getClaudeClient } from '../claude-client';
import { buildBriefingPrompt } from '../prompts/briefing-prompt';
import type { BriefingOutput, AgentInvocation } from '../types';

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const REQUIRED_BRIEFING_FIELDS: (keyof BriefingOutput)[] = [
  'projectName',
  'businessName',
  'businessDescription',
  'targetAudience',
  'audiencePainPoints',
  'audienceDesires',
  'uniqueSellingProposition',
  'mainOffer',
  'offerBenefits',
  'brandVoiceTone',
  'callToActionText',
  'callToActionUrl',
  'pageType',
];

function validateBriefingOutput(data: Record<string, unknown>): BriefingOutput {
  const missingFields: string[] = [];

  for (const field of REQUIRED_BRIEFING_FIELDS) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    throw new BriefingAgentError(
      `O briefing retornado pelo Claude esta incompleto. Campos obrigatorios ausentes: ${missingFields.join(', ')}`,
      'VALIDATION_FAILED'
    );
  }

  // Validate that array fields are actually arrays
  const arrayFields: (keyof BriefingOutput)[] = [
    'audiencePainPoints',
    'audienceDesires',
    'offerBenefits',
    'socialProofElements',
  ];

  for (const field of arrayFields) {
    if (data[field] !== undefined && data[field] !== null && !Array.isArray(data[field])) {
      throw new BriefingAgentError(
        `O campo "${field}" deveria ser um array, mas recebeu o tipo "${typeof data[field]}".`,
        'VALIDATION_FAILED'
      );
    }
  }

  // Validate pageType is one of the accepted values
  const validPageTypes = [
    'landing-page',
    'sales-page',
    'squeeze-page',
    'webinar-page',
    'thank-you-page',
    'coming-soon',
    'portfolio',
    'lead-capture',
  ];

  if (!validPageTypes.includes(data.pageType as string)) {
    throw new BriefingAgentError(
      `O tipo de pagina "${data.pageType}" nao e valido. Tipos aceitos: ${validPageTypes.join(', ')}`,
      'VALIDATION_FAILED'
    );
  }

  return data as unknown as BriefingOutput;
}

// ---------------------------------------------------------------------------
// Apply safe defaults for optional fields
// ---------------------------------------------------------------------------

function applyDefaults(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...data,
    offerPrice: data.offerPrice ?? null,
    competitorUrls: Array.isArray(data.competitorUrls) ? data.competitorUrls : [],
    existingBrandColors: Array.isArray(data.existingBrandColors) ? data.existingBrandColors : null,
    additionalNotes: typeof data.additionalNotes === 'string' ? data.additionalNotes : '',
    logoUrl: typeof data.logoUrl === 'string' ? data.logoUrl : null,
    socialProofElements: Array.isArray(data.socialProofElements) ? data.socialProofElements : [],
    guaranteeDescription: typeof data.guaranteeDescription === 'string' ? data.guaranteeDescription : null,
    urgencyElement: typeof data.urgencyElement === 'string' ? data.urgencyElement : null,
  };
}

// ---------------------------------------------------------------------------
// Main execution function
// ---------------------------------------------------------------------------

export async function executeBriefing(userInput: string): Promise<BriefingOutput> {
  const client = getClaudeClient();

  // Step 1: Build the system prompt using the dedicated prompt builder
  const systemPrompt = buildBriefingPrompt();

  // Step 2: Prepare the invocation configuration
  const invocation: AgentInvocation = {
    systemPrompt,
    userMessage: userInput,
    temperature: 0.4, // Lower temperature for structured extraction (factual, less creative)
    maxTokens: 4096,
  };

  // Step 3: Call Claude and parse the JSON response
  const rawData = await client.invokeAndParseJson<Record<string, unknown>>(invocation);

  // Step 4: Apply safe defaults for optional fields
  const dataWithDefaults = applyDefaults(rawData);

  // Step 5: Validate all required fields are present and correctly typed
  const validatedOutput = validateBriefingOutput(dataWithDefaults);

  // Step 6: Return the validated, typed briefing output
  return validatedOutput;
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export type BriefingAgentErrorCode = 'VALIDATION_FAILED' | 'EXECUTION_FAILED';

export class BriefingAgentError extends Error {
  public readonly code: BriefingAgentErrorCode;

  constructor(message: string, code: BriefingAgentErrorCode) {
    super(message);
    this.name = 'BriefingAgentError';
    this.code = code;
    Object.setPrototypeOf(this, BriefingAgentError.prototype);
  }
}
