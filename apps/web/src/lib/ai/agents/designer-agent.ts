// ---------------------------------------------------------------------------
// designer-agent.ts — Generates design tokens, section design specs, and template selections
// ---------------------------------------------------------------------------

import { getClaudeClient } from '../claude-client';
import { buildDesignPrompt } from '../prompts/design-prompt';
import type {
  BriefingOutput,
  StrategyOutput,
  DesignOutput,
  DesignTokens,
  SectionDesign,
  AgentInvocation,
} from '../types';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const VALID_LAYOUTS = ['single-column', 'two-column', 'grid', 'alternating', 'split', 'full-width'] as const;
const VALID_BACKGROUND_STYLES = ['solid', 'gradient', 'image', 'transparent'] as const;

function validateDesignTokens(tokens: Record<string, unknown>): string[] {
  const errors: string[] = [];

  // Validate colors object exists and has the critical color keys
  if (typeof tokens.colors !== 'object' || tokens.colors === null) {
    errors.push('"tokens.colors" e obrigatorio e deve ser um objeto.');
  } else {
    const requiredColors = ['primary', 'background', 'textPrimary', 'textSecondary'];
    const colors = tokens.colors as Record<string, unknown>;
    for (const colorKey of requiredColors) {
      if (typeof colors[colorKey] !== 'string' || (colors[colorKey] as string).trim().length === 0) {
        errors.push(`"tokens.colors.${colorKey}" e obrigatorio.`);
      }
    }
  }

  // Validate typography object exists and has the essential font keys
  if (typeof tokens.typography !== 'object' || tokens.typography === null) {
    errors.push('"tokens.typography" e obrigatorio e deve ser um objeto.');
  } else {
    const typography = tokens.typography as Record<string, unknown>;
    if (typeof typography.fontFamilyHeading !== 'string') {
      errors.push('"tokens.typography.fontFamilyHeading" e obrigatorio.');
    }
    if (typeof typography.fontFamilyBody !== 'string') {
      errors.push('"tokens.typography.fontFamilyBody" e obrigatorio.');
    }
  }

  // Validate spacing object exists
  if (typeof tokens.spacing !== 'object' || tokens.spacing === null) {
    errors.push('"tokens.spacing" e obrigatorio e deve ser um objeto.');
  }

  // Validate borders object exists
  if (typeof tokens.borders !== 'object' || tokens.borders === null) {
    errors.push('"tokens.borders" e obrigatorio e deve ser um objeto.');
  }

  // Validate shadows object exists
  if (typeof tokens.shadows !== 'object' || tokens.shadows === null) {
    errors.push('"tokens.shadows" e obrigatorio e deve ser um objeto.');
  }

  // Validate breakpoints object exists
  if (typeof tokens.breakpoints !== 'object' || tokens.breakpoints === null) {
    errors.push('"tokens.breakpoints" e obrigatorio e deve ser um objeto.');
  }

  return errors;
}

function validateSectionDesign(section: Record<string, unknown>, index: number): string[] {
  const errors: string[] = [];

  if (typeof section.sectionId !== 'string' || (section.sectionId as string).trim().length === 0) {
    errors.push(`Secao de design no indice ${index}: "sectionId" e obrigatorio.`);
  }

  if (typeof section.sectionType !== 'string') {
    errors.push(`Secao de design no indice ${index}: "sectionType" e obrigatorio.`);
  }

  if (typeof section.templateName !== 'string' || (section.templateName as string).trim().length === 0) {
    errors.push(`Secao de design no indice ${index} ("${section.sectionId}"): "templateName" e obrigatorio.`);
  }

  if (!VALID_LAYOUTS.includes(section.layout as typeof VALID_LAYOUTS[number])) {
    errors.push(
      `Secao de design no indice ${index} ("${section.sectionId}"): "layout" deve ser um dos valores: ${VALID_LAYOUTS.join(', ')}. Recebido: "${section.layout}"`
    );
  }

  if (!VALID_BACKGROUND_STYLES.includes(section.backgroundStyle as typeof VALID_BACKGROUND_STYLES[number])) {
    errors.push(
      `Secao de design no indice ${index} ("${section.sectionId}"): "backgroundStyle" deve ser um dos valores: ${VALID_BACKGROUND_STYLES.join(', ')}. Recebido: "${section.backgroundStyle}"`
    );
  }

  return errors;
}

function validateDesignOutput(data: Record<string, unknown>, strategy: StrategyOutput): DesignOutput {
  const errors: string[] = [];

  // Validate tokens
  if (typeof data.tokens !== 'object' || data.tokens === null) {
    errors.push('"tokens" e obrigatorio e deve ser um objeto DesignTokens.');
  } else {
    errors.push(...validateDesignTokens(data.tokens as Record<string, unknown>));
  }

  // Validate googleFontsUrls
  if (!Array.isArray(data.googleFontsUrls)) {
    errors.push('"googleFontsUrls" e obrigatorio e deve ser um array de URLs.');
  }

  // Validate sections array
  if (!Array.isArray(data.sections)) {
    errors.push('"sections" e obrigatorio e deve ser um array de objetos SectionDesign.');
  } else {
    for (let index = 0; index < (data.sections as unknown[]).length; index++) {
      errors.push(
        ...validateSectionDesign((data.sections as Record<string, unknown>[])[index], index)
      );
    }

    // Check that all required strategy sections have a design spec
    const designSectionIds = new Set(
      (data.sections as Record<string, unknown>[]).map((sectionItem) => sectionItem.sectionId)
    );

    const missingSections = strategy.sections
      .filter((strategySectionItem) => strategySectionItem.required)
      .filter((strategySectionItem) => !designSectionIds.has(strategySectionItem.id));

    if (missingSections.length > 0) {
      errors.push(
        `Secoes obrigatorias da estrategia sem design correspondente: ${missingSections
          .map((sectionItem) => `"${sectionItem.id}"`)
          .join(', ')}`
      );
    }
  }

  // Validate globalStyles
  if (typeof data.globalStyles !== 'string') {
    errors.push('"globalStyles" e obrigatorio e deve ser uma string de CSS global.');
  }

  // Validate faviconEmoji
  if (typeof data.faviconEmoji !== 'string' || (data.faviconEmoji as string).trim().length === 0) {
    errors.push('"faviconEmoji" e obrigatorio.');
  }

  // Validate ogImagePrompt
  if (typeof data.ogImagePrompt !== 'string' || (data.ogImagePrompt as string).trim().length === 0) {
    errors.push('"ogImagePrompt" e obrigatorio.');
  }

  if (errors.length > 0) {
    throw new DesignerAgentError(
      `O design retornado pelo Claude falhou na validacao:\n- ${errors.join('\n- ')}`,
      'VALIDATION_FAILED'
    );
  }

  return data as unknown as DesignOutput;
}

// ---------------------------------------------------------------------------
// Apply safe defaults for design tokens sub-properties
// ---------------------------------------------------------------------------

function applyTokenDefaults(tokens: Record<string, unknown>): DesignTokens {
  const colors = (tokens.colors ?? {}) as Record<string, string>;
  const typography = (tokens.typography ?? {}) as Record<string, string>;
  const spacing = (tokens.spacing ?? {}) as Record<string, string>;
  const borders = (tokens.borders ?? {}) as Record<string, string>;
  const shadows = (tokens.shadows ?? {}) as Record<string, string>;
  const breakpoints = (tokens.breakpoints ?? {}) as Record<string, string>;

  return {
    colors: {
      primary: colors.primary ?? '#2563eb',
      primaryDark: colors.primaryDark ?? '#1d4ed8',
      primaryLight: colors.primaryLight ?? '#60a5fa',
      secondary: colors.secondary ?? '#7c3aed',
      secondaryDark: colors.secondaryDark ?? '#6d28d9',
      secondaryLight: colors.secondaryLight ?? '#a78bfa',
      accent: colors.accent ?? '#f59e0b',
      background: colors.background ?? '#ffffff',
      backgroundAlt: colors.backgroundAlt ?? '#f8fafc',
      surface: colors.surface ?? '#ffffff',
      textPrimary: colors.textPrimary ?? '#0f172a',
      textSecondary: colors.textSecondary ?? '#475569',
      textMuted: colors.textMuted ?? '#94a3b8',
      border: colors.border ?? '#e2e8f0',
      success: colors.success ?? '#22c55e',
      warning: colors.warning ?? '#f59e0b',
      error: colors.error ?? '#ef4444',
    },
    typography: {
      fontFamilyHeading: typography.fontFamilyHeading ?? "'Inter', sans-serif",
      fontFamilyBody: typography.fontFamilyBody ?? "'Inter', sans-serif",
      fontSizeBase: typography.fontSizeBase ?? '1rem',
      fontSizeSmall: typography.fontSizeSmall ?? '0.875rem',
      fontSizeLarge: typography.fontSizeLarge ?? '1.25rem',
      fontSizeXLarge: typography.fontSizeXLarge ?? '1.5rem',
      fontSizeHero: typography.fontSizeHero ?? '3rem',
      lineHeightTight: typography.lineHeightTight ?? '1.25',
      lineHeightNormal: typography.lineHeightNormal ?? '1.5',
      lineHeightRelaxed: typography.lineHeightRelaxed ?? '1.75',
      fontWeightNormal: typography.fontWeightNormal ?? '400',
      fontWeightMedium: typography.fontWeightMedium ?? '500',
      fontWeightBold: typography.fontWeightBold ?? '700',
      fontWeightExtraBold: typography.fontWeightExtraBold ?? '800',
    },
    spacing: {
      sectionPaddingVertical: spacing.sectionPaddingVertical ?? '5rem',
      sectionPaddingHorizontal: spacing.sectionPaddingHorizontal ?? '1.5rem',
      containerMaxWidth: spacing.containerMaxWidth ?? '1200px',
      gap: spacing.gap ?? '2rem',
      gapSmall: spacing.gapSmall ?? '1rem',
      gapLarge: spacing.gapLarge ?? '3rem',
    },
    borders: {
      radius: borders.radius ?? '0.5rem',
      radiusSmall: borders.radiusSmall ?? '0.25rem',
      radiusLarge: borders.radiusLarge ?? '1rem',
      radiusFull: borders.radiusFull ?? '9999px',
      width: borders.width ?? '1px',
    },
    shadows: {
      small: shadows.small ?? '0 1px 2px rgba(0,0,0,0.05)',
      medium: shadows.medium ?? '0 4px 6px rgba(0,0,0,0.1)',
      large: shadows.large ?? '0 10px 25px rgba(0,0,0,0.15)',
    },
    breakpoints: {
      mobile: breakpoints.mobile ?? '480px',
      tablet: breakpoints.tablet ?? '768px',
      desktop: breakpoints.desktop ?? '1024px',
      wide: breakpoints.wide ?? '1280px',
    },
  };
}

function applyDefaults(data: Record<string, unknown>): Record<string, unknown> {
  // Normalize tokens with safe defaults
  if (typeof data.tokens === 'object' && data.tokens !== null) {
    data.tokens = applyTokenDefaults(data.tokens as Record<string, unknown>);
  }

  // Ensure googleFontsUrls is an array
  if (!Array.isArray(data.googleFontsUrls)) {
    data.googleFontsUrls = [];
  }

  // Normalize section designs
  if (Array.isArray(data.sections)) {
    data.sections = (data.sections as Record<string, unknown>[]).map((section) => ({
      sectionId: section.sectionId ?? '',
      sectionType: section.sectionType ?? 'custom',
      templateName: section.templateName ?? 'default',
      layout: VALID_LAYOUTS.includes(section.layout as typeof VALID_LAYOUTS[number])
        ? section.layout
        : 'single-column',
      backgroundStyle: VALID_BACKGROUND_STYLES.includes(section.backgroundStyle as typeof VALID_BACKGROUND_STYLES[number])
        ? section.backgroundStyle
        : 'solid',
      backgroundValue: typeof section.backgroundValue === 'string' ? section.backgroundValue : '',
      customStyles: typeof section.customStyles === 'object' && section.customStyles !== null
        ? section.customStyles
        : {},
    }));
  }

  // Ensure globalStyles is a string
  if (typeof data.globalStyles !== 'string') {
    data.globalStyles = '';
  }

  // Ensure faviconEmoji has a fallback
  if (typeof data.faviconEmoji !== 'string' || data.faviconEmoji.trim().length === 0) {
    data.faviconEmoji = '🌐';
  }

  // Ensure ogImagePrompt has a fallback
  if (typeof data.ogImagePrompt !== 'string') {
    data.ogImagePrompt = '';
  }

  return data;
}

// ---------------------------------------------------------------------------
// Main execution function
// ---------------------------------------------------------------------------

export async function executeDesign(
  briefing: BriefingOutput,
  strategy: StrategyOutput
): Promise<DesignOutput> {
  const client = getClaudeClient();

  // Step 1: Build the design prompt
  const systemPrompt = buildDesignPrompt(briefing, strategy);

  // Step 2: Prepare the user message with briefing and strategy context
  const userMessage = JSON.stringify(
    {
      briefing: {
        businessName: briefing.businessName,
        businessDescription: briefing.businessDescription,
        brandVoiceTone: briefing.brandVoiceTone,
        existingBrandColors: briefing.existingBrandColors,
        logoUrl: briefing.logoUrl,
        pageType: briefing.pageType,
      },
      strategy: {
        awarenessLevel: strategy.awarenessLevel,
        sections: strategy.sections,
        toneGuidelines: strategy.toneGuidelines,
        positioningStatement: strategy.positioningStatement,
      },
      instructions: [
        `Gere design tokens completos (cores, tipografia, espacamento, bordas, sombras, breakpoints).`,
        `Selecione um template e layout apropriado para CADA secao da estrategia.`,
        `Se o briefing inclui cores de marca existentes, use-as como base para a paleta.`,
        `Gere URLs do Google Fonts para as fontes escolhidas.`,
        `Inclua CSS global com variaves CSS correspondentes aos tokens.`,
        `Escolha um emoji de favicon que represente o negocio.`,
        `Escreva um prompt descritivo para geracao de imagem Open Graph.`,
      ],
    },
    null,
    2
  );

  // Step 3: Call Claude
  const invocation: AgentInvocation = {
    systemPrompt,
    userMessage,
    temperature: 0.6,
    maxTokens: 8192,
  };

  const rawData = await client.invokeAndParseJson<Record<string, unknown>>(invocation);

  // Step 4: Apply safe defaults
  const dataWithDefaults = applyDefaults(rawData);

  // Step 5: Validate the design output
  const validatedDesign = validateDesignOutput(dataWithDefaults, strategy);

  return validatedDesign;
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export type DesignerAgentErrorCode = 'VALIDATION_FAILED' | 'EXECUTION_FAILED';

export class DesignerAgentError extends Error {
  public readonly code: DesignerAgentErrorCode;

  constructor(message: string, code: DesignerAgentErrorCode) {
    super(message);
    this.name = 'DesignerAgentError';
    this.code = code;
    Object.setPrototypeOf(this, DesignerAgentError.prototype);
  }
}
