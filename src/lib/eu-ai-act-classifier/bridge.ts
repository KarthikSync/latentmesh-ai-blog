// Bridge translation map — pure functions that transform the wizard's
// Result payload into the two profile vectors consumed by the obligation
// filter. Based on wizard-to-obligations-bridge-v1.7.md Sections 1-2.

import type { Result, Article50Trigger } from "../../data/eu-ai-act-classifier/types";
import type {
  DisplayContext,
  ModelProfile,
  ObligationRecord,
  ObligationRiskLevel,
  SystemProfile,
} from "../../data/eu-ai-act-classifier/obligation-types";

// ── 1.1 Risk level translation (many-to-one) ────────────────────

const RISK_LEVEL_MAP: Record<string, ObligationRiskLevel> = {
  prohibited: "unacceptable",
  high_risk_annex_i: "high_risk",
  high_risk_annex_iii: "high_risk",
  limited_risk_transparency: "limited_risk",
  minimal_risk: "minimal_risk",
};

export function translateRiskLevel(systemResult: string): ObligationRiskLevel | null {
  return RISK_LEVEL_MAP[systemResult] ?? null;
}

// ── 1.2 Annex III category extraction ────────────────────────────
// Uses the explicit matched_annex_iii_categories[] field on the engine
// Result (the "ideal contract" per bridge spec Section 1.2).

export function extractAnnexCategories(wizardResult: Result): string[] {
  return wizardResult.matched_annex_iii_categories ?? [];
}

// ── 1.3 Role translation (system track only) ─────────────────────

export function translateRole(providerOrDeployer: string): string[] {
  switch (providerOrDeployer) {
    case "Provider":
      return ["provider"];
    case "Deployer":
      return ["deployer"];
    case "Both":
      return ["provider", "deployer"];
    default:
      return [];
  }
}

// ── 1.5 Art. 50 trigger ID alignment ─────────────────────────────
// Maps our engine's trigger field names to the obligation schema's
// system_conditions.condition_id values. Three names diverge.

const TRIGGER_TO_CONDITION: Record<string, string> = {
  interacts_directly_with_people: "system_interacts_with_natural_persons",
  generates_synthetic_content: "system_generates_synthetic_content",
  emotion_recognition_or_biometric_cat: "system_categorises_biometrically",
  generates_deepfakes: "system_generates_synthetic_content",
  ai_generated_public_interest_text: "system_generates_text_published_as_news",
};

export function mapTriggerToConditionId(trigger: string): string {
  return TRIGGER_TO_CONDITION[trigger] ?? trigger;
}

// ── 1.6 Display effective date computation ──────────────────────
// Pure function. Never mutates the obligation record. Render-time only.

export function computeDisplayEffectiveFrom(
  obligation: ObligationRecord,
  timingContext: DisplayContext["timing"],
  systemResult: string
): string {
  if (obligation.obligation_track !== "system") {
    return obligation.effective_from; // model-track: no overrides
  }

  let displayDate = obligation.effective_from;

  // Annex I systems get extended deadline
  if (systemResult === "high_risk_annex_i" && timingContext.annex_i_extended_deadline) {
    displayDate = timingContext.annex_i_extended_deadline;
  }

  // Public authority deployers get extended deadline
  if (
    timingContext.public_authority_deadline &&
    obligation.applies_to_roles?.includes("deployer")
  ) {
    displayDate = timingContext.public_authority_deadline;
  }

  return displayDate;
}

// ── 2. Assembled profile vectors ─────────────────────────────────

export function buildSystemProfile(
  wizardResult: Result,
  providerOrDeployer: string
): SystemProfile {
  return {
    risk_level: translateRiskLevel(wizardResult.system_result),
    annex_iii_categories: extractAnnexCategories(wizardResult),
    art_50_triggers: wizardResult.article_50_transparency_triggers ?? [],
    role: translateRole(providerOrDeployer),
    applicable_frameworks: ["eu_ai_act"],
    geography: ["EU"],
    is_sme: null,
  };
}

export function buildModelProfile(wizardResult: Result): ModelProfile {
  return {
    model_result: wizardResult.model_result,
    gpai_obligation_holder: wizardResult.gpai_obligation_holder,
    gpai_open_source_exception: wizardResult.gpai_open_source_exception ?? false,
    applicable_frameworks: ["eu_ai_act"],
  };
}

export function buildDisplayContext(wizardResult: Result): DisplayContext {
  return {
    timing: wizardResult.timing,
    confidence: wizardResult.confidence,
    system_result: wizardResult.system_result,
  };
}
