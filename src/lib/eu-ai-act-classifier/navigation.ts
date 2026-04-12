// Navigation helpers — pure functions for the step state machine.
// Separated from classification so the UI's routing is testable without
// building a full Result.

import { CLASSIFIER_SCHEMA } from "../../data/eu-ai-act-classifier/schema";
import type { AnswerSet, StepId } from "../../data/eu-ai-act-classifier/types";

// Canonical step order. step4_tier2 is not in CLASSIFIER_SCHEMA.steps — it's
// a virtual sub-screen for each domain selected in step4_tier1.
const STEP_ORDER: StepId[] = [
  "step0",
  "step1",
  "step_branch",
  "step2",
  "step3",
  "step4_tier1",
  "step4_tier2",
  "step5",
  "step6",
  "step7",
  "step8",
];

// Which step each field belongs to. Used by fieldsAfter() for back-navigation cascade.
const FIELD_TO_STEP: Record<string, StepId> = {
  // step0
  is_ai_system: "step0",
  // step_branch
  assessment_target: "step_branch",
  // step1
  eu_nexus: "step1",
  military_defence_exclusion: "step1",
  third_country_public_authority: "step1",
  scientific_rnd_only: "step1",
  premarket_testing_only: "step1",
  personal_nonprofessional: "step1",
  free_open_source: "step1",
  // step2 — prohibited practices and exceptions
  prohibited_manipulation: "step2",
  prohibited_vulnerability_exploitation: "step2",
  prohibited_social_scoring: "step2",
  prohibited_criminal_prediction: "step2",
  prohibited_criminal_prediction_exception: "step2",
  prohibited_facial_scraping: "step2",
  prohibited_emotion_workplace_education: "step2",
  prohibited_emotion_medical_safety_exception: "step2",
  prohibited_biometric_categorisation: "step2",
  prohibited_biometric_exception: "step2",
  prohibited_rbi_law_enforcement: "step2",
  rbi_exception_victim_search: "step2",
  rbi_exception_imminent_threat: "step2",
  rbi_exception_serious_crime: "step2",
  // step3
  is_safety_component_or_product: "step3",
  covered_by_annex_i_legislation: "step3",
  requires_third_party_conformity: "step3",
  // step4 — domain selection and sub-use-cases
  selected_domains: "step4_tier1",
  bio_remote_identification: "step4_tier2",
  bio_verification_only: "step4_tier2",
  bio_categorisation: "step4_tier2",
  bio_emotion_recognition: "step4_tier2",
  infra_safety_component: "step4_tier2",
  infra_digital: "step4_tier2",
  edu_admission: "step4_tier2",
  edu_learning_outcomes: "step4_tier2",
  edu_level_assessment: "step4_tier2",
  edu_proctoring: "step4_tier2",
  emp_recruitment: "step4_tier2",
  emp_work_decisions: "step4_tier2",
  svc_public_benefits: "step4_tier2",
  svc_creditworthiness: "step4_tier2",
  svc_financial_fraud_only: "step4_tier2",
  svc_insurance: "step4_tier2",
  svc_emergency: "step4_tier2",
  le_victim_risk: "step4_tier2",
  le_polygraph: "step4_tier2",
  le_evidence: "step4_tier2",
  le_reoffending: "step4_tier2",
  le_profiling: "step4_tier2",
  mig_polygraph: "step4_tier2",
  mig_risk_assessment: "step4_tier2",
  mig_application: "step4_tier2",
  mig_identification: "step4_tier2",
  mig_travel_doc_only: "step4_tier2",
  justice_legal_research: "step4_tier2",
  justice_elections: "step4_tier2",
  justice_campaign_admin_only: "step4_tier2",
  // step5
  profiles_natural_persons: "step5",
  significant_risk_of_harm: "step5",
  material_influence_on_decision: "step5",
  exception_limb: "step5",
  // step6
  interacts_directly_with_people: "step6",
  generates_synthetic_content: "step6",
  standard_editing_exception: "step6",
  emotion_recognition_or_biometric_cat: "step6",
  generates_deepfakes: "step6",
  ai_generated_public_interest_text: "step6",
  public_interest_text_human_review_exception: "step6",
  // step7
  is_gpai_model: "step7",
  provider_placing_on_eu_market: "step7",
  gpai_open_source: "step7",
  training_compute_above_threshold: "step7",
  commission_designated_systemic: "step7",
  commission_rebuttal_accepted: "step7",
  // step8
  placed_on_market_before_2026_08_02: "step8",
  significant_design_change_after_cutoff: "step8",
  intended_for_public_authority_use: "step8",
  gpai_on_market_before_2025_08_02: "step8",
};

// ── Skip predicates ──────────────────────────────────────────────────────

function isStepReachable(step: StepId, answers: AnswerSet): boolean {
  // Early terminations short-circuit everything after them
  if (answers.is_ai_system === "no" && step !== "step0") return false;

  const scopeExit =
    answers.eu_nexus === "no" ||
    answers.military_defence_exclusion === "yes" ||
    answers.third_country_public_authority === "yes" ||
    answers.scientific_rnd_only === "yes" ||
    answers.premarket_testing_only === "yes";
  if (scopeExit && step !== "step0" && step !== "step1") return false;

  // ── Track-based routing (Option A: early branch) ──────────────
  const scope = answers.assessment_target as string | undefined;

  // System-track steps: hidden for model_only
  const systemOnlySteps: StepId[] = [
    "step2", "step3", "step4_tier1", "step4_tier2", "step5", "step6",
  ];
  if (scope === "model_only" && systemOnlySteps.includes(step)) return false;

  // Model-track step (step7): hidden for system_only
  if (scope === "system_only" && step === "step7") return false;

  // Step 4 tier 2 only if at least one domain selected
  if (step === "step4_tier2") {
    const domains = answers.selected_domains;
    if (!Array.isArray(domains) || domains.length === 0) return false;
  }

  // Step 5 only if annex_iii_match
  if (step === "step5") {
    if (!hasAnnexIiiMatch(answers)) return false;
  }

  return true;
}

function hasAnnexIiiMatch(answers: AnswerSet): boolean {
  const subUseCases = [
    "bio_remote_identification",
    "bio_categorisation",
    "bio_emotion_recognition",
    "infra_safety_component",
    "infra_digital",
    "edu_admission",
    "edu_learning_outcomes",
    "edu_level_assessment",
    "edu_proctoring",
    "emp_recruitment",
    "emp_work_decisions",
    "svc_public_benefits",
    "svc_creditworthiness",
    "svc_insurance",
    "svc_emergency",
    "le_victim_risk",
    "le_polygraph",
    "le_evidence",
    "le_reoffending",
    "le_profiling",
    "mig_polygraph",
    "mig_risk_assessment",
    "mig_application",
    "mig_identification",
    "justice_legal_research",
    "justice_elections",
  ];
  return subUseCases.some((id) => answers[id] === "yes");
}

// ── Public API ────────────────────────────────────────────────────────────

export function reachableSteps(answers: AnswerSet): StepId[] {
  return STEP_ORDER.filter((s) => isStepReachable(s, answers));
}

export function nextStep(current: StepId, answers: AnswerSet): StepId | "result" {
  const reachable = reachableSteps(answers);
  const idx = reachable.indexOf(current);
  if (idx === -1 || idx === reachable.length - 1) return "result";
  return reachable[idx + 1];
}

export function previousStep(current: StepId, answers: AnswerSet): StepId | null {
  const reachable = reachableSteps(answers);
  const idx = reachable.indexOf(current);
  if (idx <= 0) return null;
  return reachable[idx - 1];
}

export function fieldsAfter(step: StepId): string[] {
  const stepIdx = STEP_ORDER.indexOf(step);
  if (stepIdx === -1) return [];
  return Object.entries(FIELD_TO_STEP)
    .filter(([, s]) => STEP_ORDER.indexOf(s) > stepIdx)
    .map(([field]) => field);
}

export function clearFieldsAfter(answers: AnswerSet, step: StepId): AnswerSet {
  const toClear = new Set(fieldsAfter(step));
  const next: AnswerSet = {};
  for (const [k, v] of Object.entries(answers)) {
    if (!toClear.has(k)) next[k] = v;
  }
  return next;
}

// Helper for tests / UI to enumerate all known field ids
export function allFieldIds(): string[] {
  return Object.keys(FIELD_TO_STEP);
}

// Re-export for external use
export { STEP_ORDER };
export { CLASSIFIER_SCHEMA };
