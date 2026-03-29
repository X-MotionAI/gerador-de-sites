// ---------------------------------------------------------------------------
// html-validator.ts — Validates generated HTML for structural correctness
// ---------------------------------------------------------------------------

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  line: number | null;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  summary: string;
}

// Tags that are self-closing and should not be flagged as unclosed
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

// Tags whose absence as a pair is tolerable (they can self-close in HTML5)
const OPTIONAL_CLOSE_ELEMENTS = new Set([
  'li', 'dt', 'dd', 'p', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot',
  'colgroup', 'option', 'optgroup',
]);

/**
 * Validates a complete HTML string for common issues in generated pages.
 */
export function validateHtml(html: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  checkUnclosedTags(html, issues);
  checkRequiredSections(html, issues);
  checkPlaceholderText(html, issues);
  checkEmptyContent(html, issues);
  checkBasicStructure(html, issues);
  checkAccessibilityBasics(html, issues);
  checkBrokenImageSources(html, issues);

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  const valid = errorCount === 0;

  let summary: string;
  if (valid && warningCount === 0) {
    summary = 'O HTML passou em todas as verificacoes sem problemas.';
  } else if (valid) {
    summary = `O HTML e valido, mas apresenta ${warningCount} aviso(s) que podem ser melhorados.`;
  } else {
    summary = `O HTML possui ${errorCount} erro(s) critico(s) e ${warningCount} aviso(s). Correcoes sao necessarias.`;
  }

  return { valid, issues, summary };
}

// ---------------------------------------------------------------------------
// Individual Checks
// ---------------------------------------------------------------------------

/**
 * Checks for unclosed HTML tags by tracking opening and closing tags.
 */
function checkUnclosedTags(html: string, issues: ValidationIssue[]): void {
  // Remove comments, script content, style content, and doctype
  const cleaned = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '');

  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g;
  const stack: { tag: string; line: number }[] = [];

  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(cleaned)) !== null) {
    const fullMatch = match[0];
    const tagName = match[1].toLowerCase();

    // Skip void/self-closing elements
    if (VOID_ELEMENTS.has(tagName)) continue;
    // Skip self-closing syntax like <div />
    if (fullMatch.endsWith('/>')) continue;

    const lineNumber = getLineNumber(cleaned, match.index);

    if (fullMatch.startsWith('</')) {
      // Closing tag
      const lastOpen = findLastOpenTag(stack, tagName);
      if (lastOpen === -1) {
        if (!OPTIONAL_CLOSE_ELEMENTS.has(tagName)) {
          issues.push({
            severity: 'warning',
            code: 'EXTRA_CLOSING_TAG',
            message: `Tag de fechamento "</${tagName}>" encontrada sem uma tag de abertura correspondente.`,
            line: lineNumber,
          });
        }
      } else {
        // Check for mismatched nesting between lastOpen and stack top
        const unclosedBetween = stack.splice(lastOpen);
        // The first element is the matching tag; the rest are unclosed
        for (let i = 1; i < unclosedBetween.length; i++) {
          const unclosed = unclosedBetween[i];
          if (!OPTIONAL_CLOSE_ELEMENTS.has(unclosed.tag)) {
            issues.push({
              severity: 'error',
              code: 'UNCLOSED_TAG',
              message: `Tag "<${unclosed.tag}>" aberta na linha ${unclosed.line} nao foi fechada antes do fechamento de "<${tagName}>".`,
              line: unclosed.line,
            });
          }
        }
      }
    } else {
      // Opening tag
      stack.push({ tag: tagName, line: lineNumber });
    }
  }

  // Remaining unclosed tags
  for (const item of stack) {
    if (!OPTIONAL_CLOSE_ELEMENTS.has(item.tag)) {
      issues.push({
        severity: 'error',
        code: 'UNCLOSED_TAG',
        message: `Tag "<${item.tag}>" aberta na linha ${item.line} nunca foi fechada.`,
        line: item.line,
      });
    }
  }
}

/**
 * Checks that the HTML contains at least a hero section and a call-to-action section.
 */
function checkRequiredSections(html: string, issues: ValidationIssue[]): void {
  const htmlLower = html.toLowerCase();

  // Check for hero section indicators
  const hasHero =
    /id\s*=\s*["']hero["']/i.test(html) ||
    /class\s*=\s*["'][^"']*hero[^"']*["']/i.test(html) ||
    /data-section\s*=\s*["']hero["']/i.test(html) ||
    /<section[^>]*hero/i.test(html) ||
    htmlLower.includes('section-hero') ||
    htmlLower.includes('hero-section');

  if (!hasHero) {
    issues.push({
      severity: 'error',
      code: 'MISSING_HERO_SECTION',
      message: 'Nenhuma secao "hero" foi encontrada. A pagina precisa ter pelo menos uma secao hero (identificada por id, classe ou atributo data-section contendo "hero").',
      line: null,
    });
  }

  // Check for call-to-action indicators
  const hasCallToAction =
    /id\s*=\s*["']cta["']/i.test(html) ||
    /class\s*=\s*["'][^"']*cta[^"']*["']/i.test(html) ||
    /data-section\s*=\s*["']cta["']/i.test(html) ||
    htmlLower.includes('section-cta') ||
    htmlLower.includes('cta-section') ||
    /<button[^>]*>/i.test(html) ||
    /<a[^>]*class\s*=\s*["'][^"']*btn[^"']*["'][^>]*>/i.test(html) ||
    /<a[^>]*class\s*=\s*["'][^"']*button[^"']*["'][^>]*>/i.test(html);

  if (!hasCallToAction) {
    issues.push({
      severity: 'error',
      code: 'MISSING_CTA_SECTION',
      message: 'Nenhuma chamada para acao (CTA) foi encontrada. A pagina precisa ter pelo menos um botao ou secao de conversao.',
      line: null,
    });
  }
}

/**
 * Checks for remaining placeholder text patterns like {{variable}}, [PLACEHOLDER], etc.
 */
function checkPlaceholderText(html: string, issues: ValidationIssue[]): void {
  const placeholderPatterns = [
    { regex: /\{\{[^}]+\}\}/g, description: 'marcador de template com chaves duplas ({{...}})' },
    { regex: /\[([A-Z_]{2,})\]/g, description: 'marcador de texto em colchetes maiusculos ([...])' },
    { regex: /\{%[^%]+%\}/g, description: 'marcador de template Jinja/Liquid ({%...%})' },
    { regex: /<%[^%]+%>/g, description: 'marcador de template ERB/EJS (<%...%>)' },
    { regex: /\$\{[^}]+\}/g, description: 'interpolacao de string literal (${...})' },
  ];

  for (const { regex, description } of placeholderPatterns) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null) {
      issues.push({
        severity: 'error',
        code: 'PLACEHOLDER_TEXT',
        message: `Texto provisorio encontrado: "${match[0]}" (${description}). Todos os marcadores devem ser substituidos por conteudo real.`,
        line: getLineNumber(html, match.index),
      });
    }
  }

  // Check for common placeholder phrases
  const placeholderPhrases = [
    'Lorem ipsum',
    'TODO',
    'FIXME',
    'PLACEHOLDER',
    'INSERT TEXT HERE',
    'YOUR TEXT HERE',
    'SAMPLE TEXT',
    'CHANGE THIS',
  ];

  for (const phrase of placeholderPhrases) {
    const index = html.indexOf(phrase);
    if (index !== -1) {
      // Make sure it is not inside a comment or script
      const before = html.substring(Math.max(0, index - 10), index);
      if (!before.includes('<!--') && !before.includes('//')) {
        issues.push({
          severity: 'warning',
          code: 'PLACEHOLDER_PHRASE',
          message: `Possivel texto provisorio encontrado: "${phrase}". Verifique se deveria ser substituido por conteudo real.`,
          line: getLineNumber(html, index),
        });
      }
    }
  }
}

/**
 * Checks for empty content in critical elements.
 */
function checkEmptyContent(html: string, issues: ValidationIssue[]): void {
  const criticalTags = ['h1', 'h2', 'h3', 'title', 'button', 'a'];

  for (const tag of criticalTags) {
    const pattern = new RegExp(`<${tag}(\\s[^>]*)?>\\s*<\\/${tag}>`, 'gi');
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null) {
      issues.push({
        severity: tag === 'title' || tag === 'h1' ? 'error' : 'warning',
        code: 'EMPTY_ELEMENT',
        message: `Elemento "<${tag}>" encontrado vazio. Elementos criticos devem conter texto visivel.`,
        line: getLineNumber(html, match.index),
      });
    }
  }
}

/**
 * Checks basic HTML document structure.
 */
function checkBasicStructure(html: string, issues: ValidationIssue[]): void {
  if (!/<!DOCTYPE\s+html>/i.test(html)) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_DOCTYPE',
      message: 'Declaracao <!DOCTYPE html> nao encontrada no inicio do documento.',
      line: 1,
    });
  }

  if (!/<html[^>]*>/i.test(html)) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_HTML_TAG',
      message: 'Tag <html> nao encontrada no documento.',
      line: null,
    });
  }

  if (!/<head[^>]*>/i.test(html)) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_HEAD_TAG',
      message: 'Tag <head> nao encontrada no documento.',
      line: null,
    });
  }

  if (!/<body[^>]*>/i.test(html)) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_BODY_TAG',
      message: 'Tag <body> nao encontrada no documento.',
      line: null,
    });
  }

  if (!/<meta[^>]*charset/i.test(html)) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_CHARSET',
      message: 'Declaracao de charset nao encontrada. Adicione <meta charset="UTF-8"> na tag <head>.',
      line: null,
    });
  }

  if (!/<meta[^>]*viewport/i.test(html)) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_VIEWPORT',
      message: 'Meta tag de viewport nao encontrada. A pagina pode nao ser responsiva em dispositivos moveis.',
      line: null,
    });
  }

  if (!/<title[^>]*>.+<\/title>/is.test(html)) {
    issues.push({
      severity: 'error',
      code: 'MISSING_TITLE',
      message: 'A tag <title> esta ausente ou vazia. Toda pagina precisa de um titulo.',
      line: null,
    });
  }
}

/**
 * Checks basic accessibility requirements.
 */
function checkAccessibilityBasics(html: string, issues: ValidationIssue[]): void {
  // Check for lang attribute on html tag
  if (/<html(?:\s[^>]*)?>/i.test(html) && !/<html[^>]*\slang\s*=/i.test(html)) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_LANG_ATTR',
      message: 'Atributo "lang" nao encontrado na tag <html>. Isso e importante para acessibilidade e motores de busca.',
      line: null,
    });
  }

  // Check for images without alt attributes
  const imgPattern = /<img(?:\s[^>]*)?>/gi;
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgPattern.exec(html)) !== null) {
    if (!/\salt\s*=/i.test(imgMatch[0])) {
      issues.push({
        severity: 'warning',
        code: 'IMG_MISSING_ALT',
        message: 'Imagem encontrada sem atributo "alt". Todas as imagens devem ter texto alternativo para acessibilidade.',
        line: getLineNumber(html, imgMatch.index),
      });
    }
  }
}

/**
 * Checks for obviously broken image source attributes.
 */
function checkBrokenImageSources(html: string, issues: ValidationIssue[]): void {
  const srcPattern = /<img[^>]*\ssrc\s*=\s*["']([^"']*)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = srcPattern.exec(html)) !== null) {
    const src = match[1].trim();
    if (src === '' || src === '#' || src === 'undefined' || src === 'null') {
      issues.push({
        severity: 'warning',
        code: 'BROKEN_IMG_SRC',
        message: `Imagem com atributo "src" invalido encontrada: "${src}". A fonte da imagem deve ser uma URL valida.`,
        line: getLineNumber(html, match.index),
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the 1-based line number for a given character index in the text.
 */
function getLineNumber(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text[i] === '\n') {
      line++;
    }
  }
  return line;
}

/**
 * Finds the last occurrence of a tag name in the stack, searching from the end.
 * Returns the index or -1 if not found.
 */
function findLastOpenTag(
  stack: { tag: string; line: number }[],
  tagName: string
): number {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].tag === tagName) {
      return i;
    }
  }
  return -1;
}
