// ---------------------------------------------------------------------------
// html-assembler.ts — Composes section HTML templates into a full page
// ---------------------------------------------------------------------------

import type { DesignTokens } from '../ai/types';

interface AssemblePageOptions {
  sections: string[];
  tokens: DesignTokens;
  metaTitle: string;
  metaDescription: string;
  ogTitle?: string;
  ogDescription?: string;
  googleFontsUrls?: string[];
  faviconEmoji?: string;
  globalStyles?: string;
  language?: string;
}

/**
 * Converts the DesignTokens object into a string of CSS custom properties
 * to be applied on the :root selector.
 */
function tokensToCssVariables(tokens: DesignTokens): string {
  const lines: string[] = [];

  // Colors
  for (const [key, value] of Object.entries(tokens.colors)) {
    const cssName = camelToKebab(key);
    lines.push(`  --color-${cssName}: ${value};`);
  }

  // Typography
  for (const [key, value] of Object.entries(tokens.typography)) {
    const cssName = camelToKebab(key);
    lines.push(`  --typography-${cssName}: ${value};`);
  }

  // Spacing
  for (const [key, value] of Object.entries(tokens.spacing)) {
    const cssName = camelToKebab(key);
    lines.push(`  --spacing-${cssName}: ${value};`);
  }

  // Borders
  for (const [key, value] of Object.entries(tokens.borders)) {
    const cssName = camelToKebab(key);
    lines.push(`  --border-${cssName}: ${value};`);
  }

  // Shadows
  for (const [key, value] of Object.entries(tokens.shadows)) {
    const cssName = camelToKebab(key);
    lines.push(`  --shadow-${cssName}: ${value};`);
  }

  // Breakpoints
  for (const [key, value] of Object.entries(tokens.breakpoints)) {
    const cssName = camelToKebab(key);
    lines.push(`  --breakpoint-${cssName}: ${value};`);
  }

  return lines.join('\n');
}

/**
 * Converts a camelCase string to kebab-case.
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Generates the base/reset CSS that applies design tokens globally.
 */
function generateBaseStyles(): string {
  return `
    *,
    *::before,
    *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      font-size: var(--typography-font-size-base);
      line-height: var(--typography-line-height-normal);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      scroll-behavior: smooth;
    }

    body {
      font-family: var(--typography-font-family-body);
      color: var(--color-text-primary);
      background-color: var(--color-background);
      min-height: 100vh;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: var(--typography-font-family-heading);
      font-weight: var(--typography-font-weight-bold);
      line-height: var(--typography-line-height-tight);
      color: var(--color-text-primary);
    }

    a {
      color: var(--color-primary);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    a:hover {
      color: var(--color-primary-dark);
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
    }

    button {
      cursor: pointer;
      font-family: inherit;
    }

    section {
      padding: var(--spacing-section-padding-vertical) var(--spacing-section-padding-horizontal);
    }

    .container {
      width: 100%;
      max-width: var(--spacing-container-max-width);
      margin-left: auto;
      margin-right: auto;
      padding-left: var(--spacing-gap);
      padding-right: var(--spacing-gap);
    }
  `;
}

/**
 * Assembles a complete, self-contained HTML page from section fragments
 * and design tokens.
 */
export function assembleFullPage(options: AssemblePageOptions): string {
  const {
    sections,
    tokens,
    metaTitle,
    metaDescription,
    ogTitle,
    ogDescription,
    googleFontsUrls = [],
    faviconEmoji = '🌐',
    globalStyles = '',
    language = 'pt-BR',
  } = options;

  const cssVariables = tokensToCssVariables(tokens);
  const baseStyles = generateBaseStyles();

  const fontLinks = googleFontsUrls
    .map((url) => `    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="${escapeHtml(url)}" rel="stylesheet">`)
    .join('\n');

  const faviconSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${faviconEmoji}</text></svg>`;

  const sectionsHtml = sections
    .map((sectionHtml) => sectionHtml.trim())
    .filter((sectionHtml) => sectionHtml.length > 0)
    .join('\n\n    ');

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeAttr(metaDescription)}">
    <meta property="og:title" content="${escapeAttr(ogTitle ?? metaTitle)}">
    <meta property="og:description" content="${escapeAttr(ogDescription ?? metaDescription)}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeAttr(ogTitle ?? metaTitle)}">
    <meta name="twitter:description" content="${escapeAttr(ogDescription ?? metaDescription)}">
    <title>${escapeHtml(metaTitle)}</title>
    <link rel="icon" href="${faviconSvg}">
${fontLinks}
    <style>
      :root {
${cssVariables}
      }
${baseStyles}
${globalStyles ? `\n      /* Global custom styles */\n${globalStyles}` : ''}
    </style>
</head>
<body>
    ${sectionsHtml}
</body>
</html>`;
}

/**
 * Escapes HTML special characters for use in text content.
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Escapes a string for use inside an HTML attribute value.
 */
function escapeAttr(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
