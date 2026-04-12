// Obligation record types — defines the schema for obligation records,
// profile vectors, and display context used by the bridge, filter, and
// obligation list components.
//
// Based on Obligation Record Schema v1.4 (v1.3 + model-track extension
// from wizard-to-obligations-bridge-v1.7.md Section 5).

// ── Obligation track discriminator ──────────────────────────────

export type ObligationTrack = "system" | "model";

// ── Risk level (obligation schema enum, not wizard enum) ────────

export type ObligationRiskLevel =
  | "unacceptable"
  | "high_risk"
  | "limited_risk"
  | "minimal_risk";

// ── Model-specific enums ────────────────────────────────────────

export type ModelRiskLevel = "gpai" | "gpai_systemic_risk";
export type HolderType = "self" | "upstream_provider";
export type OpenSourceTreatment = "none" | "reduced_scope" | "exempt";

// ── Priority ────────────────────────────────────────────────────

export type PriorityLabel = "high" | "medium" | "standard";

// ── Category taxonomy (20 system categories + 1 model category) ─

export type ObligationCategory =
  | "risk_management"
  | "data_governance"
  | "technical_documentation"
  | "record_keeping"
  | "transparency_deployer"
  | "human_oversight"
  | "accuracy_robustness_cybersecurity"
  | "quality_management"
  | "conformity_assessment"
  | "registration"
  | "post_market_monitoring"
  | "incident_reporting"
  | "corrective_action"
  | "cooperation_with_authorities"
  | "deployer_general_duties"
  | "deployer_monitoring"
  | "deployer_record_keeping"
  | "transparency_disclosure"
  | "value_chain"
  | "ai_literacy"
  | "gpai_provider_obligations";

// ── Delivery scope ──────────────────────────────────────────────

export type DeliveryScope = "system" | "organizational" | "both";

// ── Review status ───────────────────────────────────────────────

export type ReviewStatus = "draft" | "reviewed" | "approved";

// ── Sanction band ───────────────────────────────────────────────

export interface SanctionBand {
  max_fine_eur: number;
  max_fine_turnover_pct: number;
  band_label: string; // e.g., "EUR 15M / 3%"
}

// ── Legal source ────────────────────────────────────────────────

export interface LegalSource {
  article: string;
  paragraph?: string;
  eur_lex_url?: string;
}

// ── Applicability conditions (system track) ─────────────────────

export interface ApplicabilityCondition {
  risk_levels: ObligationRiskLevel[];
  annex_iii_categories?: string[];
  geographies?: string[];
  system_conditions?: SystemCondition[];
}

export interface SystemCondition {
  condition_id: string;
  description: string;
}

// ── Model applicability (model track) ───────────────────────────

export interface ModelApplicability {
  model_risk_levels: ModelRiskLevel[];
  holder_types: HolderType[];
  open_source_treatment: OpenSourceTreatment;
  open_source_note?: string;
}

// ── The obligation record itself ────────────────────────────────

export interface ObligationRecord {
  obligation_id: string;
  obligation_track: ObligationTrack;
  source_code: string; // e.g., "Art. 14(1)"
  plain_language_requirement: string;
  legal_source: LegalSource;
  source_framework: string; // "eu_ai_act"
  category: ObligationCategory;
  effective_from: string; // ISO date
  coverage_batch: string; // e.g., "batch-1"
  record_version: string;
  last_reviewed_at: string; // ISO date
  review_status: ReviewStatus;
  priority_label: PriorityLabel;
  priority_reason: string;
  sanction_band: SanctionBand;

  // System-track fields (required when obligation_track == "system")
  applies_to_roles?: string[]; // ["provider"] | ["deployer"] | ["provider", "deployer"]
  delivery_scope?: DeliveryScope;
  applicability_conditions?: ApplicabilityCondition;
  sme_treatment?: string;
  sme_treatment_note?: string;

  // Model-track fields (required when obligation_track == "model")
  model_applicability?: ModelApplicability;
}

// ── Profile vectors (built by the bridge) ───────────────────────

export interface SystemProfile {
  risk_level: ObligationRiskLevel | null;
  annex_iii_categories: string[];
  art_50_triggers: Array<{ trigger: string; article: string; obligation: string }>;
  role: string[]; // ["provider"] | ["deployer"] | ["provider", "deployer"]
  applicable_frameworks: string[];
  geography: string[];
  is_sme: boolean | null;
}

export interface ModelProfile {
  model_result: string; // "none" | "gpai" | "gpai_systemic_risk"
  gpai_obligation_holder: string;
  gpai_open_source_exception: boolean;
  applicable_frameworks: string[];
}

export interface DisplayContext {
  timing: {
    compliance_deadline: string;
    rules_enforceable_now: boolean;
    legacy_system: boolean;
    significant_change_detected: boolean;
    public_authority_deadline: string | null;
    gpai_legacy_deadline: string | null;
    annex_i_extended_deadline: string | null;
  };
  confidence: string;
  system_result: string;
}

// ── Rendered obligation (after filtering + ranking) ─────────────

export interface RenderedObligation extends ObligationRecord {
  display_effective_from: string; // computed from timing context
  enforceable_now: boolean;
  why_applies: string; // generated explanation
}
