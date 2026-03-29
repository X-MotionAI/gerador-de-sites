// ---------------------------------------------------------------------------
// builder-agent.ts — Assembles final HTML from copy, design tokens, and templates
// ---------------------------------------------------------------------------

import { getClaudeClient } from '../claude-client';
import { buildBuildPrompt } from '../prompts/build-prompt';
import type {
  BriefingOutput,
  StrategyOutput,
  CopyOutput,
  DesignOutput,
  BuildOutput,
  SectionBuild,
  SectionCopy,
  SectionDesign,
  DesignTokens,
  AgentInvocation,
} from '../types';

// ---------------------------------------------------------------------------
// Section template registry
// ---------------------------------------------------------------------------
// Each template is a skeletal HTML structure that the builder agent fills with
// actual copy and design tokens.  Using a hardcoded map keeps the system
// self-contained without filesystem dependencies at runtime.

const SECTION_TEMPLATES: Record<string, string> = {
  // ---- Hero ----
  'hero-centered': `
<section id="{{sectionId}}" class="section-hero" style="{{sectionStyles}}">
  <div class="container">
    <h1 class="hero-headline">{{headline}}</h1>
    <p class="hero-subheadline">{{subheadline}}</p>
    <p class="hero-body">{{bodyText}}</p>
    <a href="{{ctaUrl}}" class="btn btn-primary">{{callToAction}}</a>
  </div>
</section>`,

  'hero-split': `
<section id="{{sectionId}}" class="section-hero section-hero--split" style="{{sectionStyles}}">
  <div class="container hero-grid">
    <div class="hero-content">
      <h1 class="hero-headline">{{headline}}</h1>
      <p class="hero-subheadline">{{subheadline}}</p>
      <p class="hero-body">{{bodyText}}</p>
      <a href="{{ctaUrl}}" class="btn btn-primary">{{callToAction}}</a>
    </div>
    <div class="hero-media">
      <!-- placeholder for image or illustration -->
    </div>
  </div>
</section>`,

  // ---- Benefits ----
  'benefits-grid': `
<section id="{{sectionId}}" class="section-benefits" style="{{sectionStyles}}">
  <div class="container">
    <h2 class="section-headline">{{headline}}</h2>
    <p class="section-subheadline">{{subheadline}}</p>
    <ul class="benefits-grid">{{bulletItems}}</ul>
  </div>
</section>`,

  'benefits-alternating': `
<section id="{{sectionId}}" class="section-benefits section-benefits--alternating" style="{{sectionStyles}}">
  <div class="container">
    <h2 class="section-headline">{{headline}}</h2>
    <p class="section-subheadline">{{subheadline}}</p>
    <div class="benefits-list">{{bulletItems}}</div>
  </div>
</section>`,

  // ---- Features ----
  'features-cards': `
<section id="{{sectionId}}" class="section-features" style="{{sectionStyles}}">
  <div class="container">
    <h2 class="section-headline">{{headline}}</h2>
    <p class="section-subheadline">{{subheadline}}</p>
    <div class="features-grid">{{bulletItems}}</div>
  </div>
</section>`,

  // ---- Testimonials ----
  'testimonials-cards': `
<section id="{{sectionId}}" class="section-testimonials" style="{{sectionStyles}}">
  <div class="container">
    <h2 class="section-headline">{{headline}}</h2>
    <div class="testimonials-grid">{{testimonialCards}}</div>
  </div>
</section>`,

  // ---- Pricing ----
  'pricing-single': `
<section id="{{sectionId}}" class="section-pricing" style="{{sectionStyles}}">
  <div class="container">
    <h2 class="section-headline">{{headline}}</h2>
    <p class="section-subheadline">{{subheadline}}</p>
    <div class="pricing-card">{{pricingContent}}</div>
  </div>
</section>`,

  // ---- Frequently Asked Questions ----
  'faq-accordion': `
<section id="{{sectionId}}" class="section-faq" style="{{sectionStyles}}">
  <div class="container">
    <h2 class="section-headline">{{headline}}</h2>
    <div class="faq-list">{{faqItems}}</div>
  </div>
</section>`,

  // ---- Call to Action ----
  'cta-banner': `
<section id="{{sectionId}}" class="section-cta" style="{{sectionStyles}}">
  <div class="container">
    <h2 class="section-headline">{{headline}}</h2>
    <p class="section-body">{{bodyText}}</p>
    <a href="{{ctaUrl}}" class="btn btn-primary btn-large">{{callToAction}}</a>
  </div>
</section>`,

  // ---- Social Proof ----
  'social-proof-logos': `
<section id="{{sectionId}}" class="section-social-proof" style="{{sectionStyles}}">
  <div class="container">
    <h2 class="section-headline">{{headline}}</h2>
    <p class="section-body">{{bodyText}}</p>
    <div class="social-proof-items">{{bulletItems}}</div>
  </div>
</section>`,

  // ---- Guarantee ----
  'guarantee-badge': `
<section id="{{sectionId}}" class="section-guarantee" style="{{sectionStyles}}">
  <div class="container">
    <div class="guarantee-content">
      <h2 class="section-headline">{{headline}}</h2>
      <p class="section-body">{{bodyText}}</p>
    </div>
  </div>
</section>`,

  // ---- Problem / Agitation ----
  'problem-agitation-story': `
<section id="{{sectionId}}" class="section-problem" style="{{sectionStyles}}">
  <div class="container">
    <h2 class="section-headline">{{headline}}</h2>
    <p class="section-subheadline">{{subheadline}}</p>
    <div class="section-body">{{bodyText}}</div>
    <ul class="problem-points">{{bulletItems}}</ul>
  </div>
</section>`,

  // ---- Solution ----
  'solution-reveal': `
<section id="{{sectionId}}" class="section-solution" style="{{sectionStyles}}">
  <div class="container">
    <h2 class="section-headline">{{headline}}</h2>
    <p class="section-subheadline">{{subheadline}}</p>
    <div class="section-body">{{bodyText}}</div>
  </div>
</section>`,

  // ---- How It Works ----
  'how-it-works-steps': `
<section id="{{sectionId}}" class="section-how-it-works" style="{{sectionStyles}}">
  <div class="container">
    <h2 class="section-headline">{{headline}}</h2>
    <p class="section-subheadline">{{subheadline}}</p>
    <div class="steps-list">{{bulletItems}}</div>
  </div>
</section>`,

  // ---- Comparison ----
  'comparison-table': `
<section id="{{sectionId}}" class="section-comparison" style="{{sectionStyles}}">
  <div class="container">
    <h2 class="section-headline">{{headline}}</h2>
    <div class="comparison-content">{{bodyText}}</div>
  </div>
</section>`,

  // ---- Urgency ----
  'urgency-countdown': `
<section id="{{sectionId}}" class="section-urgency" style="{{sectionStyles}}">
  <div class="container">
    <h2 class="section-headline">{{headline}}</h2>
    <p class="section-body">{{bodyText}}</p>
    <a href="{{ctaUrl}}" class="btn btn-primary">{{callToAction}}</a>
  </div>
</section>`,

  // ---- About ----
  'about-story': `
<section id="{{sectionId}}" class="section-about" style="{{sectionStyles}}">
  <div class="container">
    <h2 class="section-headline">{{headline}}</h2>
    <p class="section-subheadline">{{subheadline}}</p>
    <div class="section-body">{{bodyText}}</div>
  </div>
</section>`,

  // ---- Generic fallback ----
  'default': `
<section id="{{sectionId}}" class="section-custom" style="{{sectionStyles}}">
  <div class="container">
    <h2 class="section-headline">{{headline}}</h2>
    <p class="section-subheadline">{{subheadline}}</p>
    <div class="section-body">{{bodyText}}</div>
    <ul class="section-bullets">{{bulletItems}}</ul>
  </div>
</section>`,
};

// ---------------------------------------------------------------------------
// Helper: resolve template name from design spec
// ---------------------------------------------------------------------------

function resolveTemplateName(sectionDesign: SectionDesign): string {
  const name = sectionDesign.templateName;
  if (SECTION_TEMPLATES[name]) {
    return name;
  }
  // Fallback: try a generic mapping based on sectionType
  const typeToTemplate: Record<string, string> = {
    'hero': 'hero-centered',
    'benefits': 'benefits-grid',
    'features': 'features-cards',
    'testimonials': 'testimonials-cards',
    'pricing': 'pricing-single',
    'faq': 'faq-accordion',
    'cta': 'cta-banner',
    'social-proof': 'social-proof-logos',
    'guarantee': 'guarantee-badge',
    'problem-agitation': 'problem-agitation-story',
    'solution': 'solution-reveal',
    'how-it-works': 'how-it-works-steps',
    'comparison': 'comparison-table',
    'urgency': 'urgency-countdown',
    'about': 'about-story',
    'custom': 'default',
  };

  return typeToTemplate[sectionDesign.sectionType] ?? 'default';
}

// ---------------------------------------------------------------------------
// Helper: generate CSS custom properties from design tokens
// ---------------------------------------------------------------------------

function generateCssVariables(tokens: DesignTokens): string {
  const lines: string[] = [':root {'];

  // Colors
  for (const [key, value] of Object.entries(tokens.colors)) {
    lines.push(`  --color-${camelToKebab(key)}: ${value};`);
  }

  // Typography
  for (const [key, value] of Object.entries(tokens.typography)) {
    lines.push(`  --typography-${camelToKebab(key)}: ${value};`);
  }

  // Spacing
  for (const [key, value] of Object.entries(tokens.spacing)) {
    lines.push(`  --spacing-${camelToKebab(key)}: ${value};`);
  }

  // Borders
  for (const [key, value] of Object.entries(tokens.borders)) {
    lines.push(`  --border-${camelToKebab(key)}: ${value};`);
  }

  // Shadows
  for (const [key, value] of Object.entries(tokens.shadows)) {
    lines.push(`  --shadow-${camelToKebab(key)}: ${value};`);
  }

  lines.push('}');
  return lines.join('\n');
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// ---------------------------------------------------------------------------
// HTML validation (basic structural checks)
// ---------------------------------------------------------------------------

interface HtmlValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateHtml(html: string): HtmlValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check that the HTML contains the essential document structure
  if (!html.includes('<!DOCTYPE html>') && !html.includes('<!doctype html>')) {
    errors.push('O HTML gerado nao contem a declaracao DOCTYPE.');
  }

  if (!html.includes('<html')) {
    errors.push('O HTML gerado nao contem a tag <html>.');
  }

  if (!html.includes('<head>') && !html.includes('<head ')) {
    errors.push('O HTML gerado nao contem a tag <head>.');
  }

  if (!html.includes('<body>') && !html.includes('<body ')) {
    errors.push('O HTML gerado nao contem a tag <body>.');
  }

  if (!html.includes('<title>')) {
    warnings.push('O HTML gerado nao contem a tag <title>.');
  }

  if (!html.includes('meta') || !html.includes('viewport')) {
    warnings.push('O HTML gerado nao contem a meta tag de viewport para responsividade.');
  }

  // Check for unclosed section tags (basic check)
  const openSections = (html.match(/<section/g) ?? []).length;
  const closeSections = (html.match(/<\/section>/g) ?? []).length;
  if (openSections !== closeSections) {
    errors.push(
      `Numero de tags <section> abertas (${openSections}) nao corresponde ao numero de tags </section> fechadas (${closeSections}).`
    );
  }

  // Check minimum size (a real page should be at least a few kilobytes)
  if (html.length < 500) {
    warnings.push('O HTML gerado e muito curto (menos de 500 caracteres). Pode estar incompleto.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Main execution function
// ---------------------------------------------------------------------------

export async function executeBuild(
  briefing: BriefingOutput,
  strategy: StrategyOutput,
  copy: CopyOutput,
  design: DesignOutput
): Promise<BuildOutput> {
  const client = getClaudeClient();

  // Step 1: Resolve templates for each section
  const sectionTemplates: { sectionId: string; templateHtml: string; copy: SectionCopy; design: SectionDesign }[] = [];

  for (const sectionDesign of design.sections) {
    const sectionCopy = copy.sections.find(
      (copySectionItem) => copySectionItem.sectionId === sectionDesign.sectionId
    );

    if (!sectionCopy) {
      // If no copy exists for this section, skip it (non-required sections may lack copy)
      continue;
    }

    const templateName = resolveTemplateName(sectionDesign);
    const templateHtml = SECTION_TEMPLATES[templateName] ?? SECTION_TEMPLATES['default'];

    sectionTemplates.push({
      sectionId: sectionDesign.sectionId,
      templateHtml,
      copy: sectionCopy,
      design: sectionDesign,
    });
  }

  // Step 2: Generate CSS custom properties from design tokens
  const cssVariables = generateCssVariables(design.tokens);

  // Step 3: Build the comprehensive prompt for Claude
  const templateMap: Record<string, string> = {};
  for (const section of sectionTemplates) {
    templateMap[section.sectionId] = section.templateHtml;
  }
  const systemPrompt = buildBuildPrompt(briefing, strategy, copy, design, templateMap);

  const userMessage = JSON.stringify(
    {
      briefing: {
        projectName: briefing.projectName,
        businessName: briefing.businessName,
        callToActionUrl: briefing.callToActionUrl,
        pageType: briefing.pageType,
        logoUrl: briefing.logoUrl,
      },
      meta: {
        metaTitle: copy.metaTitle,
        metaDescription: copy.metaDescription,
        ogTitle: copy.ogTitle,
        ogDescription: copy.ogDescription,
        faviconEmoji: design.faviconEmoji,
      },
      cssVariables,
      globalStyles: design.globalStyles,
      googleFontsUrls: design.googleFontsUrls,
      sectionTemplates: sectionTemplates.map((templateItem) => ({
        sectionId: templateItem.sectionId,
        templateHtml: templateItem.templateHtml,
        copy: templateItem.copy,
        design: {
          layout: templateItem.design.layout,
          backgroundStyle: templateItem.design.backgroundStyle,
          backgroundValue: templateItem.design.backgroundValue,
          customStyles: templateItem.design.customStyles,
        },
      })),
      instructions: [
        'Monte uma pagina HTML completa e independente (single-file), incluindo DOCTYPE, head, body.',
        'Inclua todas as CSS custom properties geradas no bloco <style> do <head>.',
        'Inclua os links para Google Fonts no <head>.',
        'Inclua a meta tag de viewport para responsividade.',
        'Preencha cada template de secao com o copy correspondente, substituindo todos os placeholders ({{headline}}, {{subheadline}}, {{bodyText}}, {{bulletItems}}, {{callToAction}}, {{ctaUrl}}, etc.).',
        'Adicione CSS responsivo usando os breakpoints dos design tokens.',
        'O HTML final deve ser completo, valido e pronto para deploy.',
        'Inclua estilos inline ou em <style> — NAO referencie arquivos CSS externos alem do Google Fonts.',
        'Adicione acessibilidade basica: lang="pt-BR", alt em imagens, roles semanticos.',
        'Retorne o JSON no formato: { "sections": [...], "fullPageHtml": "..." }',
      ],
    },
    null,
    2
  );

  // Step 4: Call Claude with high max tokens (HTML output is large)
  const invocation: AgentInvocation = {
    systemPrompt,
    userMessage,
    temperature: 0.3, // Low temperature for precise code generation
    maxTokens: 16384, // High limit for full HTML page output
  };

  const rawData = await client.invokeAndParseJson<Record<string, unknown>>(invocation);

  // Step 5: Extract and validate the HTML
  const fullPageHtml = typeof rawData.fullPageHtml === 'string' ? rawData.fullPageHtml : '';

  const htmlValidation = validateHtml(fullPageHtml);

  if (!htmlValidation.valid) {
    throw new BuilderAgentError(
      `O HTML gerado falhou na validacao estrutural:\n- ${htmlValidation.errors.join('\n- ')}`,
      'HTML_VALIDATION_FAILED'
    );
  }

  // Step 6: Parse section builds
  const sections: SectionBuild[] = Array.isArray(rawData.sections)
    ? (rawData.sections as Record<string, unknown>[]).map((section) => ({
        sectionId: typeof section.sectionId === 'string' ? section.sectionId : '',
        sectionType: (section.sectionType as SectionBuild['sectionType']) ?? 'custom',
        html: typeof section.html === 'string' ? section.html : '',
        inlineCss: typeof section.inlineCss === 'string' ? section.inlineCss : null,
      }))
    : [];

  // Step 7: Return the build output
  const buildOutput: BuildOutput = {
    sections,
    fullPageHtml,
    assembledAt: new Date().toISOString(),
  };

  return buildOutput;
}

// ---------------------------------------------------------------------------
// Exported utilities (for use in other modules or tests)
// ---------------------------------------------------------------------------

export { SECTION_TEMPLATES, generateCssVariables, validateHtml };
export type { HtmlValidationResult };

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export type BuilderAgentErrorCode = 'HTML_VALIDATION_FAILED' | 'TEMPLATE_NOT_FOUND' | 'EXECUTION_FAILED';

export class BuilderAgentError extends Error {
  public readonly code: BuilderAgentErrorCode;

  constructor(message: string, code: BuilderAgentErrorCode) {
    super(message);
    this.name = 'BuilderAgentError';
    this.code = code;
    Object.setPrototypeOf(this, BuilderAgentError.prototype);
  }
}
