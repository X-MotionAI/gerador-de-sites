// ---------------------------------------------------------------------------
// types.ts — All TypeScript types and interfaces for the site generator pipeline
// ---------------------------------------------------------------------------

// ---- Enumerations and Literal Types ----

export type PageType =
  | 'landing-page'
  | 'sales-page'
  | 'squeeze-page'
  | 'webinar-page'
  | 'thank-you-page'
  | 'coming-soon'
  | 'portfolio'
  | 'lead-capture';

export type AwarenessLevel =
  | 'unaware'
  | 'problem-aware'
  | 'solution-aware'
  | 'product-aware'
  | 'most-aware';

export type PipelineStage =
  | 'briefing'
  | 'strategy'
  | 'copy'
  | 'design'
  | 'build'
  | 'qa'
  | 'deploy';

export type StageStatus =
  | 'pending'
  | 'in_progress'
  | 'needs_review'
  | 'approved'
  | 'blocked';

// ---- Section Configuration ----

export interface SectionConfig {
  id: string;
  name: string;
  sectionType:
    | 'hero'
    | 'features'
    | 'benefits'
    | 'testimonials'
    | 'pricing'
    | 'faq'
    | 'cta'
    | 'social-proof'
    | 'guarantee'
    | 'about'
    | 'problem-agitation'
    | 'solution'
    | 'how-it-works'
    | 'comparison'
    | 'urgency'
    | 'custom';
  order: number;
  required: boolean;
  description: string;
}

// ---- Design Tokens ----

export interface DesignTokens {
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    secondaryDark: string;
    secondaryLight: string;
    accent: string;
    background: string;
    backgroundAlt: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamilyHeading: string;
    fontFamilyBody: string;
    fontSizeBase: string;
    fontSizeSmall: string;
    fontSizeLarge: string;
    fontSizeXLarge: string;
    fontSizeHero: string;
    lineHeightTight: string;
    lineHeightNormal: string;
    lineHeightRelaxed: string;
    fontWeightNormal: string;
    fontWeightMedium: string;
    fontWeightBold: string;
    fontWeightExtraBold: string;
  };
  spacing: {
    sectionPaddingVertical: string;
    sectionPaddingHorizontal: string;
    containerMaxWidth: string;
    gap: string;
    gapSmall: string;
    gapLarge: string;
  };
  borders: {
    radius: string;
    radiusSmall: string;
    radiusLarge: string;
    radiusFull: string;
    width: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
  };
}

// ---- Quality Gate ----

export interface QualityGateIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  suggestion: string;
}

export interface QualityGateResult {
  passed: boolean;
  score: number;
  maxScore: number;
  issues: QualityGateIssue[];
  evaluatedAt: string;
}

// ---- Stage 1: Briefing Output ----

export interface BriefingOutput {
  projectName: string;
  businessName: string;
  businessDescription: string;
  targetAudience: string;
  audiencePainPoints: string[];
  audienceDesires: string[];
  uniqueSellingProposition: string;
  mainOffer: string;
  offerPrice: string | null;
  offerBenefits: string[];
  competitorUrls: string[];
  brandVoiceTone: string;
  existingBrandColors: string[] | null;
  callToActionText: string;
  callToActionUrl: string;
  pageType: PageType;
  additionalNotes: string;
  logoUrl: string | null;
  socialProofElements: string[];
  guaranteeDescription: string | null;
  urgencyElement: string | null;
}

// ---- Stage 2: Strategy Output ----

export interface StrategyOutput {
  awarenessLevel: AwarenessLevel;
  positioningStatement: string;
  valueStack: ValueStackItem[];
  emotionalDrivers: string[];
  rationalDrivers: string[];
  objectionsToAddress: string[];
  persuasionSequence: string;
  sections: SectionConfig[];
  recommendedPageStructure: string;
  keyMessages: {
    primary: string;
    secondary: string;
    supporting: string[];
  };
  toneGuidelines: {
    voice: string;
    formality: 'casual' | 'balanced' | 'formal';
    emotionalIntensity: 'low' | 'medium' | 'high';
    examples: string[];
  };
}

export interface ValueStackItem {
  name: string;
  description: string;
  perceivedValue: string;
  actualPrice: string | null;
  order: number;
}

// ---- Stage 3: Copy Output ----

export interface SectionCopy {
  sectionId: string;
  sectionType: SectionConfig['sectionType'];
  headline: string;
  subheadline: string | null;
  bodyText: string;
  bulletPoints: string[];
  callToAction: string | null;
  supportingText: string | null;
  testimonials: TestimonialCopy[] | null;
  faqItems: FaqItemCopy[] | null;
  pricingDetails: PricingCopy | null;
}

export interface TestimonialCopy {
  quote: string;
  authorName: string;
  authorTitle: string;
  authorCompany: string | null;
  authorImageUrl: string | null;
  rating: number | null;
}

export interface FaqItemCopy {
  question: string;
  answer: string;
}

export interface PricingCopy {
  planName: string;
  price: string;
  pricePeriod: string | null;
  features: string[];
  highlighted: boolean;
  callToAction: string;
}

export interface CopyOutput {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  sections: SectionCopy[];
}

// ---- Stage 4: Design Output ----

export interface SectionDesign {
  sectionId: string;
  sectionType: SectionConfig['sectionType'];
  templateName: string;
  layout: 'single-column' | 'two-column' | 'grid' | 'alternating' | 'split' | 'full-width';
  backgroundStyle: 'solid' | 'gradient' | 'image' | 'transparent';
  backgroundValue: string;
  customStyles: Record<string, string>;
}

export interface DesignOutput {
  tokens: DesignTokens;
  googleFontsUrls: string[];
  sections: SectionDesign[];
  globalStyles: string;
  faviconEmoji: string;
  ogImagePrompt: string;
}

// ---- Stage 5: Build Output ----

export interface SectionBuild {
  sectionId: string;
  sectionType: SectionConfig['sectionType'];
  html: string;
  inlineCss: string | null;
}

export interface BuildOutput {
  sections: SectionBuild[];
  fullPageHtml: string;
  assembledAt: string;
}

// ---- Stage 6: Quality Assurance Output ----

export interface QAIssue {
  severity: 'critical' | 'major' | 'minor' | 'suggestion';
  category:
    | 'html-structure'
    | 'accessibility'
    | 'seo'
    | 'copy-quality'
    | 'design-consistency'
    | 'performance'
    | 'responsiveness'
    | 'conversion-optimization';
  description: string;
  location: string;
  suggestedFix: string;
}

export interface QAOutput {
  verdict: 'approved' | 'needs-fixes' | 'rejected';
  overallScore: number;
  issues: QAIssue[];
  categoryScores: Record<QAIssue['category'], number>;
  summary: string;
  approvedAt: string | null;
}

// ---- Pipeline State ----

export interface StageState {
  status: StageStatus;
  data: Record<string, unknown>;
  qualityGate: QualityGateResult | null;
  attempts: number;
  startedAt: string | null;
  completedAt: string | null;
}

export interface PipelineState {
  projectId: string;
  currentStage: PipelineStage;
  stages: Record<PipelineStage, StageState>;
  createdAt: string;
  updatedAt: string;
}

// ---- Pipeline Events ----

export interface PipelineEvent {
  type: 'stage_started' | 'stage_completed' | 'stage_rejected' | 'quality_gate_evaluated' | 'pipeline_completed';
  stage: PipelineStage;
  timestamp: string;
  data: Record<string, unknown>;
}

// ---- Agent Invocation ----

export interface AgentInvocation {
  systemPrompt: string;
  userMessage: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}
