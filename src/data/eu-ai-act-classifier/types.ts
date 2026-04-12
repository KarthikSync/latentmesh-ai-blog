// EU AI Act Classifier — type definitions
// Single source of truth for the question tree, consumed by both engine and UI.
// Data lives in ./steps/*.ts and is aggregated in ./schema.ts.

export const SCHEMA_VERSION = "1.4" as const;

// ── Result enums ───────────────────────────────────────────────────────────

export type SystemResult =
  | "not_ai_system"
  | "out_of_scope"
  | "prohibited"
  | "high_risk_annex_i"
  | "high_risk_annex_iii"
  | "limited_risk_transparency"
  | "minimal_risk";

export type ModelResult = "none" | "gpai" | "gpai_systemic_risk";

export type GpaiObligationHolder =
  | "self"
  | "upstream_provider"
  | "unknown"
  | "not_applicable";

export type ScopeStatus = "in_scope" | "excluded_under_art_2_12" | "out_of_scope";

export type ConfidenceTier = "clear_match" | "likely_match" | "ambiguous_consult_legal";

// ── Step identifiers ──────────────────────────────────────────────────────

export type StepId =
  | "step0"
  | "step1"
  | "step2"
  | "step3"
  | "step4_tier1"
  | "step4_tier2"
  | "step5"
  | "step6"
  | "step7"
  | "step8";

// ── Answer set ────────────────────────────────────────────────────────────

export type YesNo = "yes" | "no";
export type YesNoUnsure = "yes" | "no" | "unsure";
export type AnswerValue = YesNoUnsure | string | string[] | boolean | null;
export type AnswerSet = Record<string, AnswerValue>;

// ── Question tree ─────────────────────────────────────────────────────────

export interface LegalRef {
  article: string;
  recital?: string;
  quote?: string;
}

export interface QuestionOption {
  value: string;
  label: string;
  subLabel?: string;
}

export type QuestionType =
  | "yes_no"
  | "yes_no_unsure"
  | "single_select"
  | "multi_select";

export interface QuestionDef {
  id: string;
  step: StepId;
  order: number;
  type: QuestionType;
  prompt: string;
  why: string;
  helper?: string;
  examples?: { yes?: string[]; no?: string[] };
  options?: QuestionOption[];
  legal: LegalRef;
  showIf?: (a: AnswerSet) => boolean;
  crossRefWarning?: { targetStep: StepId; message: string };
  isExceptionChild?: string;
  // Optional per-question overrides for yes/no/unsure answer labels.
  // Only used by yes_no and yes_no_unsure question types. If unset,
  // the card falls back to "Yes" / "No" / "I'm not sure".
  answerLabels?: {
    yes?: string;
    no?: string;
    unsure?: string;
  };
}

// ── Step 2 — prohibited practices ─────────────────────────────────────────

export interface ProhibitedExceptionDef {
  id: string;
  question: string;
  helper?: string;
  legal: LegalRef;
}

export interface ProhibitedPracticeDef {
  id: string;
  name: string;
  summary: string;
  exampleYes: string;
  exampleNo: string;
  exceptions: ProhibitedExceptionDef[];
  legal: LegalRef;
}

// ── Step 3 — Annex I products ─────────────────────────────────────────────

export interface AnnexIProduct {
  id: string;
  label: string;
  regulation: string;
}

// ── Step 4 — Annex III domains ────────────────────────────────────────────

export interface SubUseCaseDef {
  id: string;
  label: string;
  helper: string;
  annexRef: string;
  excludesFromHighRisk?: boolean;
  isExclusionGate?: boolean; // for svc_financial_fraud_only, mig_travel_doc_only, justice_campaign_admin_only
  crossRef?: { article: string; note: string };
}

export interface DomainDef {
  id: string;
  annexPoint: string;
  title: string;
  description: string;
  triggers: string[];
  subUseCases: SubUseCaseDef[];
}

// ── Step definition ───────────────────────────────────────────────────────

export interface StepDef {
  id: StepId;
  title: string;
  shortLabel: string;
  intro?: string;
  questions: QuestionDef[];
  domains?: DomainDef[];
  prohibitedPractices?: ProhibitedPracticeDef[];
  annexIProducts?: AnnexIProduct[];
}

// ── Timing milestones ─────────────────────────────────────────────────────

export interface TimingMilestone {
  id: string;
  label: string;
  date: string; // ISO yyyy-mm-dd
  status: "enforceable" | "upcoming" | "future";
}

// ── Top-level schema ──────────────────────────────────────────────────────

export interface ClassifierSchema {
  version: typeof SCHEMA_VERSION;
  steps: StepDef[];
  displayLabels: Record<SystemResult | ModelResult, string>;
  obligationsTemplates: Record<SystemResult, string[]>;
  timingMilestones: TimingMilestone[];
}

// ── Engine result ─────────────────────────────────────────────────────────

export interface SystemReason {
  code: string;
  label: string;
  legal_ref: string;
  plain_explanation: string;
}

export interface Article50Trigger {
  trigger: string;
  article: string;
  obligation: string;
}

export interface Article6_3Exception {
  checked: boolean;
  applies: boolean;
  reason?: string;
  provider_documentation_required: boolean;
  registration_required_art_49_2: boolean;
}

export interface OpenSourceFlags {
  flagged: boolean;
  exclusion_applies: boolean;
  exclusion_article: string | null;
}

export interface Timing {
  compliance_deadline: string;
  rules_enforceable_now: boolean;
  legacy_system: boolean;
  significant_change_detected: boolean;
  public_authority_deadline: string | null;
  gpai_legacy_deadline: string | null;
  annex_i_extended_deadline: string | null;
}

export interface Result {
  system_result: SystemResult;
  system_reasons: SystemReason[];
  matched_annex_iii_categories: string[];
  article_6_3_exception: Article6_3Exception;
  article_50_transparency_triggers: Article50Trigger[];
  model_result: ModelResult;
  gpai_obligation_holder: GpaiObligationHolder;
  gpai_open_source_exception: boolean;
  scope_status: ScopeStatus;
  deployer_obligation_exempt: boolean;
  open_source: OpenSourceFlags;
  timing: Timing;
  confidence: ConfidenceTier;
  post_classification_notes: string[];
  unsure_fields: string[];
}
