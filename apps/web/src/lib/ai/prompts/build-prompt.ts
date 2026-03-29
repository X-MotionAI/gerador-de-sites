// ---------------------------------------------------------------------------
// build-prompt.ts — System prompt builder for the Build Agent
// ---------------------------------------------------------------------------

import type {
  BriefingOutput,
  StrategyOutput,
  CopyOutput,
  DesignOutput,
} from '../types';

/**
 * Builds the system prompt for the Build Agent.
 *
 * This is the most complex prompt in the system. The Build Agent receives
 * all upstream outputs (briefing, strategy, copy, design) plus the raw
 * HTML template strings for each section. It must compose a complete,
 * self-contained HTML page by merging template markup with copy content,
 * applying design tokens as CSS custom properties, and ensuring responsive,
 * accessible, performant output.
 */
export function buildBuildPrompt(
  briefing: BriefingOutput,
  strategy: StrategyOutput,
  copy: CopyOutput,
  design: DesignOutput,
  sectionTemplates: Record<string, string>
): string {
  const briefingJson = JSON.stringify(briefing, null, 2);
  const copyJson = JSON.stringify(copy, null, 2);
  const designJson = JSON.stringify(design, null, 2);

  const tokensCssVars = generateCssCustomProperties(design);
  const templatesSection = buildTemplatesSection(strategy, design, copy, sectionTemplates);

  return `
You are the Build Agent in a professional website generation pipeline. You receive the complete outputs from briefing, strategy, copy, and design stages, along with HTML section templates. Your job is to compose a single, complete, self-contained HTML document that is production-ready.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLE AND EXPERTISE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are a senior front-end developer specializing in high-performance, conversion-optimized landing pages. You produce clean, semantic HTML with embedded CSS and minimal, purposeful JavaScript. Your output must be a single HTML file that works perfectly when opened in any modern browser — no external dependencies except Google Fonts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRIEFING DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${briefingJson}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COPY DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${copyJson}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${designJson}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CSS CUSTOM PROPERTIES (DESIGN TOKENS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Apply these CSS custom properties to the :root selector. All components and sections must reference these variables instead of hardcoding values:

${tokensCssVars}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION TEMPLATES AND COPY MAPPING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For each section, you will find below:
1. The section template HTML (which contains {{placeholder}} variables)
2. The copy content that must replace each placeholder
3. The design configuration (layout, background, template variant)

If a section template is provided, use it as the structural foundation and replace the placeholders with the actual copy. If no template is provided for a section (template is empty or missing), you must generate the HTML for that section from scratch, following the design specifications and using the copy content.

${templatesSection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HTML DOCUMENT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The output must be a complete, valid HTML5 document with this structure:

<!DOCTYPE html>
<html lang="...">  <!-- Use appropriate lang based on copy language -->
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{metaTitle}}</title>
  <meta name="description" content="{{metaDescription}}">
  <meta property="og:title" content="{{ogTitle}}">
  <meta property="og:description" content="{{ogDescription}}">
  <meta property="og:type" content="website">
  <!-- Favicon using emoji -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>{{faviconEmoji}}</text></svg>">
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  {{googleFontsLinks}}
  <style>
    /* CSS Custom Properties */
    :root { {{design tokens}} }
    /* Global Styles */
    {{globalStyles}}
    /* Section Styles */
    {{per-section CSS}}
    /* Responsive Styles */
    {{media queries}}
    /* Animation Styles */
    {{animations}}
  </style>
</head>
<body>
  {{assembled sections in order}}
  <script>
    {{minimal JavaScript}}
  </script>
</body>
</html>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUILD RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SELF-CONTAINED: The entire page must be contained in a single HTML file. All CSS must be in a <style> tag in the <head>. All JavaScript must be in a <script> tag before </body>. No external CSS or JavaScript files (except Google Fonts).

2. SEMANTIC HTML: Use proper semantic elements:
   - <header> for the hero/navigation area
   - <main> for the primary content
   - <section> for each distinct content section with appropriate id attributes
   - <footer> for the closing call to action or footer content
   - <article> for testimonials
   - <details>/<summary> for frequently asked questions accordions
   - <nav> for any navigation elements
   - Proper heading hierarchy (h1 only once, then h2 for sections, h3 for subsections)

3. RESPONSIVE DESIGN: The page must look great on:
   - Mobile: 320px to 480px (single column, larger touch targets, appropriately sized text)
   - Tablet: 481px to 1024px (adapt layouts, moderate spacing)
   - Desktop: 1025px and above (full layouts, maximum visual impact)
   Use CSS Grid and/or Flexbox for layouts. Use the breakpoint values from the design tokens.

4. PLACEHOLDER REPLACEMENT: Replace ALL {{variable}} placeholders in templates with actual content from the copy data. No placeholder should remain in the final output. If a template has a placeholder that does not map directly to a copy field, use the most appropriate content from the copy or generate appropriate content.

5. DESIGN TOKEN APPLICATION: All colors, fonts, spacing, borders, and shadows must reference CSS custom properties (var(--token-name)). Never hardcode design values inline when a token exists.

6. BACKGROUND APPLICATION: Apply the backgroundStyle and backgroundValue from each section's design to the section's wrapper element. Ensure text remains readable over all backgrounds (add overlays for image or dark gradient backgrounds).

7. SMOOTH SCROLL: Add smooth scrolling behavior for anchor links. If there are multiple call to action buttons pointing to sections, they should scroll smoothly.

8. ANIMATIONS: Add subtle, performant animations:
   - Fade-in on scroll for sections (use Intersection Observer)
   - Smooth hover effects on buttons (scale, shadow change)
   - Accordion transitions for frequently asked questions sections
   - Do NOT use heavy animation libraries. Keep animations CSS-based where possible, with minimal JavaScript for scroll-triggered reveals.

9. INTERACTIVE ELEMENTS:
   - Frequently asked questions accordion: Clickable questions that expand/collapse answers
   - Smooth scroll for anchor links
   - Button hover and active states
   - Mobile-friendly touch interactions

10. PERFORMANCE:
    - Minimize CSS by avoiding redundant rules
    - Use CSS custom properties to avoid value repetition
    - Defer non-critical JavaScript
    - Use font-display: swap in Google Fonts URLs (already included via the &display=swap parameter)
    - Keep the total HTML file size reasonable (under 100 kilobytes ideally)

11. ACCESSIBILITY:
    - All interactive elements must be keyboard accessible
    - Buttons must have clear focus styles
    - Color contrast must meet WCAG AA standards
    - Add appropriate aria-labels where visual context is not sufficient
    - Ensure heading hierarchy is logical (h1 > h2 > h3, no skips)
    - Add role attributes to custom interactive components

12. NO LEFTOVER ARTIFACTS: The final output must not contain:
    - Any {{placeholder}} text
    - Any "Lorem ipsum" or placeholder content
    - Any TODO or FIXME comments
    - Any console.log statements
    - Any references to template systems or build tools

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JAVASCRIPT REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Include the following JavaScript functionality (all in a single <script> tag at the end of <body>):

1. SCROLL REVEAL: Use Intersection Observer to add a "visible" class to sections as they enter the viewport. Pair with CSS transitions for fade-in effects.

2. SMOOTH SCROLL: Intercept anchor link clicks and use scrollIntoView({ behavior: 'smooth' }) for smooth navigation.

3. FAQ ACCORDION: If there is a frequently asked questions section using <details>/<summary>, add optional JavaScript to close other open details when one is opened (single-open behavior).

4. MOBILE MENU: If the page has navigation, add a hamburger toggle for mobile viewports.

Keep the JavaScript minimal, vanilla (no frameworks or libraries), and wrapped in a DOMContentLoaded event listener.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Output ONLY the complete HTML document as a single string. Do not wrap it in JSON. Do not include markdown code fences. Do not include any explanatory text before or after the HTML.

The output must start with <!DOCTYPE html> and end with </html>.

CRITICAL: The output is the FINAL product delivered to the end user. It must be pixel-perfect, polished, and professional. Every detail matters.
`.trim();
}

// ---------------------------------------------------------------------------
// Helper: Generate CSS custom properties string from design tokens
// ---------------------------------------------------------------------------

function generateCssCustomProperties(design: DesignOutput): string {
  const { tokens } = design;
  const lines: string[] = [];

  lines.push(':root {');

  // Colors
  for (const [key, value] of Object.entries(tokens.colors)) {
    const cssVarName = `--color-${camelToKebab(key)}`;
    lines.push(`  ${cssVarName}: ${value};`);
  }

  // Typography
  for (const [key, value] of Object.entries(tokens.typography)) {
    const cssVarName = `--typography-${camelToKebab(key)}`;
    lines.push(`  ${cssVarName}: ${value};`);
  }

  // Spacing
  for (const [key, value] of Object.entries(tokens.spacing)) {
    const cssVarName = `--spacing-${camelToKebab(key)}`;
    lines.push(`  ${cssVarName}: ${value};`);
  }

  // Borders
  for (const [key, value] of Object.entries(tokens.borders)) {
    const cssVarName = `--border-${camelToKebab(key)}`;
    lines.push(`  ${cssVarName}: ${value};`);
  }

  // Shadows
  for (const [key, value] of Object.entries(tokens.shadows)) {
    const cssVarName = `--shadow-${camelToKebab(key)}`;
    lines.push(`  ${cssVarName}: ${value};`);
  }

  // Breakpoints
  for (const [key, value] of Object.entries(tokens.breakpoints)) {
    const cssVarName = `--breakpoint-${camelToKebab(key)}`;
    lines.push(`  ${cssVarName}: ${value};`);
  }

  lines.push('}');

  return lines.join('\n');
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// ---------------------------------------------------------------------------
// Helper: Build templates section with copy mapping for each section
// ---------------------------------------------------------------------------

function buildTemplatesSection(
  strategy: StrategyOutput,
  design: DesignOutput,
  copy: CopyOutput,
  sectionTemplates: Record<string, string>
): string {
  return strategy.sections
    .map((section, index) => {
      const sectionDesign = design.sections.find(
        (d) => d.sectionId === section.id
      );
      const sectionCopy = copy.sections.find(
        (c) => c.sectionId === section.id
      );
      const templateHtml = sectionTemplates[
        sectionDesign?.templateName ?? ''
      ] ?? sectionTemplates[section.id] ?? '';

      const copyMapping = sectionCopy
        ? `
  COPY CONTENT FOR THIS SECTION:
    headline: ${JSON.stringify(sectionCopy.headline)}
    subheadline: ${JSON.stringify(sectionCopy.subheadline)}
    bodyText: ${JSON.stringify(sectionCopy.bodyText)}
    bulletPoints: ${JSON.stringify(sectionCopy.bulletPoints)}
    callToAction: ${JSON.stringify(sectionCopy.callToAction)}
    supportingText: ${JSON.stringify(sectionCopy.supportingText)}
    testimonials: ${JSON.stringify(sectionCopy.testimonials)}
    faqItems: ${JSON.stringify(sectionCopy.faqItems)}
    pricingDetails: ${JSON.stringify(sectionCopy.pricingDetails)}`
        : '  NO COPY DATA FOUND — generate appropriate content based on section purpose.';

      const designMapping = sectionDesign
        ? `
  DESIGN CONFIG FOR THIS SECTION:
    templateName: ${sectionDesign.templateName}
    layout: ${sectionDesign.layout}
    backgroundStyle: ${sectionDesign.backgroundStyle}
    backgroundValue: ${sectionDesign.backgroundValue}
    customStyles: ${JSON.stringify(sectionDesign.customStyles)}`
        : '  NO DESIGN CONFIG FOUND — use sensible defaults.';

      return `
--- SECTION ${index + 1}: "${section.id}" (type: ${section.sectionType}) ---

${designMapping}

${copyMapping}

  TEMPLATE HTML:
${templateHtml ? templateHtml.split('\n').map((line) => '    ' + line).join('\n') : '    (No template provided — generate HTML from scratch for this section.)'}
      `.trim();
    })
    .join('\n\n');
}
