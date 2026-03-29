// ---------------------------------------------------------------------------
// pipeline-orchestrator.ts — Central state machine for the 7-stage pipeline
// ---------------------------------------------------------------------------

import type {
  PipelineStage,
  StageStatus,
  PipelineState,
  StageState,
  QualityGateResult,
  QualityGateIssue,
  PageType,
  SectionConfig,
  PipelineEvent,
} from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PIPELINE_STAGES: PipelineStage[] = [
  'briefing',
  'strategy',
  'copy',
  'design',
  'build',
  'qa',
  'deploy',
];

const MAX_FEEDBACK_LOOPS_PER_STAGE = 2;

const QUALITY_GATE_PASS_THRESHOLD = 70;

// ---------------------------------------------------------------------------
// Default section blueprints per page type
// ---------------------------------------------------------------------------

const PAGE_TYPE_SECTIONS: Record<PageType, SectionConfig[]> = {
  'landing-page': [
    { id: 'hero', name: 'Hero', sectionType: 'hero', order: 1, required: true, description: 'Secao principal com titulo, subtitulo e chamada para acao' },
    { id: 'benefits', name: 'Beneficios', sectionType: 'benefits', order: 2, required: true, description: 'Lista dos principais beneficios do produto ou servico' },
    { id: 'social-proof', name: 'Prova Social', sectionType: 'social-proof', order: 3, required: false, description: 'Depoimentos, logos de clientes, numeros de impacto' },
    { id: 'features', name: 'Funcionalidades', sectionType: 'features', order: 4, required: false, description: 'Detalhamento das funcionalidades oferecidas' },
    { id: 'cta', name: 'Chamada para Acao', sectionType: 'cta', order: 5, required: true, description: 'Secao final de conversao com botao de acao' },
  ],
  'sales-page': [
    { id: 'hero', name: 'Hero', sectionType: 'hero', order: 1, required: true, description: 'Titulo de alto impacto com proposta de valor' },
    { id: 'problem', name: 'Problema', sectionType: 'problem-agitation', order: 2, required: true, description: 'Agitacao do problema que o publico enfrenta' },
    { id: 'solution', name: 'Solucao', sectionType: 'solution', order: 3, required: true, description: 'Apresentacao da solucao oferecida' },
    { id: 'benefits', name: 'Beneficios', sectionType: 'benefits', order: 4, required: true, description: 'Stack de beneficios e transformacoes' },
    { id: 'testimonials', name: 'Depoimentos', sectionType: 'testimonials', order: 5, required: true, description: 'Historias de sucesso de clientes reais' },
    { id: 'how-it-works', name: 'Como Funciona', sectionType: 'how-it-works', order: 6, required: false, description: 'Passo a passo do funcionamento' },
    { id: 'pricing', name: 'Precos', sectionType: 'pricing', order: 7, required: true, description: 'Apresentacao de precos e planos' },
    { id: 'guarantee', name: 'Garantia', sectionType: 'guarantee', order: 8, required: true, description: 'Garantia de satisfacao ou devolucao' },
    { id: 'faq', name: 'Perguntas Frequentes', sectionType: 'faq', order: 9, required: false, description: 'Respostas para as duvidas mais comuns' },
    { id: 'urgency', name: 'Urgencia', sectionType: 'urgency', order: 10, required: false, description: 'Elemento de escassez ou urgencia' },
    { id: 'cta-final', name: 'Chamada Final', sectionType: 'cta', order: 11, required: true, description: 'Ultima chamada para acao com recapitulacao' },
  ],
  'squeeze-page': [
    { id: 'hero', name: 'Hero', sectionType: 'hero', order: 1, required: true, description: 'Titulo focado em captura de lead com formulario' },
    { id: 'benefits', name: 'Beneficios', sectionType: 'benefits', order: 2, required: true, description: 'O que o visitante recebe ao se inscrever' },
    { id: 'social-proof', name: 'Prova Social', sectionType: 'social-proof', order: 3, required: false, description: 'Indicadores de confianca' },
    { id: 'cta', name: 'Chamada para Acao', sectionType: 'cta', order: 4, required: true, description: 'Formulario de captura com botao' },
  ],
  'webinar-page': [
    { id: 'hero', name: 'Hero', sectionType: 'hero', order: 1, required: true, description: 'Titulo do webinar com data e horario' },
    { id: 'about', name: 'Sobre o Webinar', sectionType: 'about', order: 2, required: true, description: 'Descricao do conteudo do webinar' },
    { id: 'benefits', name: 'O que voce vai aprender', sectionType: 'benefits', order: 3, required: true, description: 'Topicos e aprendizados do evento' },
    { id: 'about-host', name: 'Sobre o Apresentador', sectionType: 'about', order: 4, required: false, description: 'Biografia e credenciais do apresentador' },
    { id: 'cta', name: 'Inscreva-se', sectionType: 'cta', order: 5, required: true, description: 'Formulario de inscricao no webinar' },
  ],
  'thank-you-page': [
    { id: 'hero', name: 'Confirmacao', sectionType: 'hero', order: 1, required: true, description: 'Mensagem de confirmacao e proximos passos' },
    { id: 'next-steps', name: 'Proximos Passos', sectionType: 'how-it-works', order: 2, required: true, description: 'Instrucoes sobre o que acontece a seguir' },
    { id: 'cta', name: 'Acao Adicional', sectionType: 'cta', order: 3, required: false, description: 'Oferta adicional ou compartilhamento social' },
  ],
  'coming-soon': [
    { id: 'hero', name: 'Hero', sectionType: 'hero', order: 1, required: true, description: 'Titulo com contagem regressiva ou data de lancamento' },
    { id: 'about', name: 'Sobre', sectionType: 'about', order: 2, required: false, description: 'Breve descricao do que esta por vir' },
    { id: 'cta', name: 'Lista de Espera', sectionType: 'cta', order: 3, required: true, description: 'Formulario para entrar na lista de espera' },
  ],
  'portfolio': [
    { id: 'hero', name: 'Hero', sectionType: 'hero', order: 1, required: true, description: 'Apresentacao profissional e proposta de valor' },
    { id: 'features', name: 'Trabalhos', sectionType: 'features', order: 2, required: true, description: 'Galeria de projetos ou trabalhos realizados' },
    { id: 'about', name: 'Sobre', sectionType: 'about', order: 3, required: true, description: 'Historia e valores profissionais' },
    { id: 'testimonials', name: 'Depoimentos', sectionType: 'testimonials', order: 4, required: false, description: 'Feedback de clientes anteriores' },
    { id: 'cta', name: 'Contato', sectionType: 'cta', order: 5, required: true, description: 'Formulario ou informacoes de contato' },
  ],
  'lead-capture': [
    { id: 'hero', name: 'Hero', sectionType: 'hero', order: 1, required: true, description: 'Headline de captura com formulario integrado' },
    { id: 'benefits', name: 'Beneficios', sectionType: 'benefits', order: 2, required: true, description: 'Razoes para o visitante se cadastrar' },
    { id: 'social-proof', name: 'Prova Social', sectionType: 'social-proof', order: 3, required: false, description: 'Numeros, logos ou depoimentos' },
    { id: 'faq', name: 'Perguntas Frequentes', sectionType: 'faq', order: 4, required: false, description: 'Duvidas comuns sobre o material ou oferta' },
    { id: 'cta', name: 'Formulario Final', sectionType: 'cta', order: 5, required: true, description: 'Secao final de captura com urgencia' },
  ],
};

// ---------------------------------------------------------------------------
// Pipeline Orchestrator
// ---------------------------------------------------------------------------

export class PipelineOrchestrator {
  private state: PipelineState;
  private eventLog: PipelineEvent[];

  constructor(state: PipelineState) {
    this.state = state;
    this.eventLog = [];
  }

  // ---- Static Factory ----

  static initialize(projectId: string, pageType: PageType): PipelineOrchestrator {
    const now = new Date().toISOString();

    const stages = {} as Record<PipelineStage, StageState>;

    for (const stage of PIPELINE_STAGES) {
      stages[stage] = {
        status: stage === 'briefing' ? 'in_progress' : 'pending',
        data: {},
        qualityGate: null,
        attempts: 0,
        startedAt: stage === 'briefing' ? now : null,
        completedAt: null,
      };
    }

    // Pre-populate the strategy stage data with default sections for the page type
    stages.strategy.data = {
      defaultSections: PAGE_TYPE_SECTIONS[pageType],
    };

    const state: PipelineState = {
      projectId,
      currentStage: 'briefing',
      stages,
      createdAt: now,
      updatedAt: now,
    };

    return new PipelineOrchestrator(state);
  }

  // ---- State Accessors ----

  getState(): PipelineState {
    return structuredClone(this.state);
  }

  getCurrentStage(): PipelineStage {
    return this.state.currentStage;
  }

  getCurrentStageState(): StageState {
    return structuredClone(this.state.stages[this.state.currentStage]);
  }

  getStageState(stage: PipelineStage): StageState {
    return structuredClone(this.state.stages[stage]);
  }

  getStageData<T = Record<string, unknown>>(stage: PipelineStage): T {
    return structuredClone(this.state.stages[stage].data) as T;
  }

  getEvents(): PipelineEvent[] {
    return structuredClone(this.eventLog);
  }

  getDefaultSections(pageType: PageType): SectionConfig[] {
    return structuredClone(PAGE_TYPE_SECTIONS[pageType]);
  }

  // ---- Stage Data Persistence ----

  setStageData(stage: PipelineStage, data: Record<string, unknown>): void {
    this.state.stages[stage].data = {
      ...this.state.stages[stage].data,
      ...data,
    };
    this.state.updatedAt = new Date().toISOString();
  }

  // ---- Stage Transition Logic ----

  canAdvance(): boolean {
    const current = this.state.stages[this.state.currentStage];
    return current.status === 'approved';
  }

  advance(): PipelineStage {
    if (!this.canAdvance()) {
      throw new PipelineError(
        `Nao e possivel avancar: o estagio "${this.state.currentStage}" ainda nao foi aprovado. Status atual: "${this.state.stages[this.state.currentStage].status}".`,
        'CANNOT_ADVANCE'
      );
    }

    const currentIndex = PIPELINE_STAGES.indexOf(this.state.currentStage);

    if (currentIndex === PIPELINE_STAGES.length - 1) {
      this.emitEvent('pipeline_completed', this.state.currentStage, {});
      return this.state.currentStage;
    }

    const nextStage = PIPELINE_STAGES[currentIndex + 1];
    const now = new Date().toISOString();

    // Mark current stage as completed
    this.state.stages[this.state.currentStage].completedAt = now;

    // Move to the next stage
    this.state.currentStage = nextStage;
    this.state.stages[nextStage].status = 'in_progress';
    this.state.stages[nextStage].startedAt = now;
    this.state.stages[nextStage].attempts += 1;
    this.state.updatedAt = now;

    this.emitEvent('stage_started', nextStage, {});

    return nextStage;
  }

  // ---- Stage Completion and Approval ----

  completeStage(stage: PipelineStage, data: Record<string, unknown>): void {
    if (stage !== this.state.currentStage) {
      throw new PipelineError(
        `Nao e possivel completar o estagio "${stage}" porque o estagio atual e "${this.state.currentStage}".`,
        'WRONG_STAGE'
      );
    }

    const stageState = this.state.stages[stage];

    if (stageState.status !== 'in_progress') {
      throw new PipelineError(
        `Nao e possivel completar o estagio "${stage}" porque seu status atual e "${stageState.status}", nao "in_progress".`,
        'INVALID_STATUS'
      );
    }

    stageState.data = { ...stageState.data, ...data };
    stageState.status = 'needs_review';
    this.state.updatedAt = new Date().toISOString();

    this.emitEvent('stage_completed', stage, data);
  }

  approveStage(stage: PipelineStage): void {
    const stageState = this.state.stages[stage];

    if (stageState.status !== 'needs_review') {
      throw new PipelineError(
        `Nao e possivel aprovar o estagio "${stage}" porque seu status atual e "${stageState.status}", nao "needs_review".`,
        'INVALID_STATUS'
      );
    }

    stageState.status = 'approved';
    stageState.completedAt = new Date().toISOString();
    this.state.updatedAt = new Date().toISOString();
  }

  // ---- Rejection and Feedback Loops ----

  rejectStage(stage: PipelineStage, feedback: string): void {
    const stageState = this.state.stages[stage];

    if (stageState.status !== 'needs_review') {
      throw new PipelineError(
        `Nao e possivel rejeitar o estagio "${stage}" porque seu status atual e "${stageState.status}", nao "needs_review".`,
        'INVALID_STATUS'
      );
    }

    if (stageState.attempts >= MAX_FEEDBACK_LOOPS_PER_STAGE) {
      stageState.status = 'blocked';
      stageState.data = {
        ...stageState.data,
        blockedReason: `Numero maximo de tentativas atingido (${MAX_FEEDBACK_LOOPS_PER_STAGE}). Feedback mais recente: ${feedback}`,
      };
      this.state.updatedAt = new Date().toISOString();

      throw new PipelineError(
        `O estagio "${stage}" excedeu o numero maximo de ${MAX_FEEDBACK_LOOPS_PER_STAGE} tentativas de feedback e foi bloqueado.`,
        'MAX_ATTEMPTS_EXCEEDED'
      );
    }

    stageState.status = 'in_progress';
    stageState.attempts += 1;
    stageState.data = {
      ...stageState.data,
      feedbackHistory: [
        ...((stageState.data.feedbackHistory as string[]) ?? []),
        feedback,
      ],
    };
    this.state.updatedAt = new Date().toISOString();

    this.emitEvent('stage_rejected', stage, { feedback });
  }

  unblockStage(stage: PipelineStage): void {
    const stageState = this.state.stages[stage];

    if (stageState.status !== 'blocked') {
      throw new PipelineError(
        `Nao e possivel desbloquear o estagio "${stage}" porque seu status atual e "${stageState.status}", nao "blocked".`,
        'INVALID_STATUS'
      );
    }

    stageState.status = 'in_progress';
    stageState.attempts = 0;
    this.state.updatedAt = new Date().toISOString();
  }

  // ---- Quality Gate ----

  evaluateQualityGate(
    stage: PipelineStage,
    issues: QualityGateIssue[]
  ): QualityGateResult {
    const maxScore = 100;
    let score = maxScore;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'error':
          score -= 25;
          break;
        case 'warning':
          score -= 10;
          break;
        case 'info':
          score -= 2;
          break;
      }
    }

    score = Math.max(0, score);

    const result: QualityGateResult = {
      passed: score >= QUALITY_GATE_PASS_THRESHOLD,
      score,
      maxScore,
      issues,
      evaluatedAt: new Date().toISOString(),
    };

    this.state.stages[stage].qualityGate = result;
    this.state.updatedAt = new Date().toISOString();

    this.emitEvent('quality_gate_evaluated', stage, {
      passed: result.passed,
      score: result.score,
    });

    return result;
  }

  // ---- Serialization ----

  toJson(): string {
    return JSON.stringify(this.state);
  }

  static fromJson(json: string): PipelineOrchestrator {
    const parsed = JSON.parse(json) as PipelineState;
    return new PipelineOrchestrator(parsed);
  }

  // ---- Progress Summary ----

  getProgressSummary(): {
    completedStages: number;
    totalStages: number;
    percentComplete: number;
    stageStatuses: Record<PipelineStage, StageStatus>;
  } {
    const stageStatuses = {} as Record<PipelineStage, StageStatus>;
    let completedStages = 0;

    for (const stage of PIPELINE_STAGES) {
      stageStatuses[stage] = this.state.stages[stage].status;
      if (this.state.stages[stage].status === 'approved') {
        completedStages += 1;
      }
    }

    return {
      completedStages,
      totalStages: PIPELINE_STAGES.length,
      percentComplete: Math.round((completedStages / PIPELINE_STAGES.length) * 100),
      stageStatuses,
    };
  }

  // ---- Private Helpers ----

  private emitEvent(
    type: PipelineEvent['type'],
    stage: PipelineStage,
    data: Record<string, unknown>
  ): void {
    this.eventLog.push({
      type,
      stage,
      timestamp: new Date().toISOString(),
      data,
    });
  }
}

// ---------------------------------------------------------------------------
// Pipeline error
// ---------------------------------------------------------------------------

export type PipelineErrorCode =
  | 'CANNOT_ADVANCE'
  | 'WRONG_STAGE'
  | 'INVALID_STATUS'
  | 'MAX_ATTEMPTS_EXCEEDED';

export class PipelineError extends Error {
  public readonly code: PipelineErrorCode;

  constructor(message: string, code: PipelineErrorCode) {
    super(message);
    this.name = 'PipelineError';
    this.code = code;
    Object.setPrototypeOf(this, PipelineError.prototype);
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { PIPELINE_STAGES, MAX_FEEDBACK_LOOPS_PER_STAGE, QUALITY_GATE_PASS_THRESHOLD, PAGE_TYPE_SECTIONS };
