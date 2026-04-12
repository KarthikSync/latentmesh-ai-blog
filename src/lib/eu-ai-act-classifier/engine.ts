// Classification engine — pure function producing a Result from an AnswerSet.
// No DOM dependencies. The engine walks a pipeline of step reducers that each
// take (answers, draft) and mutate the draft. All drift resolutions live here.

import { CLASSIFIER_SCHEMA } from "../../data/eu-ai-act-classifier/schema";
import {
  ART_6_3_EXCEPTION_SUCCESS_NOTE,
  DEPLOYER_EXEMPT_NOTICE,
  GPAI_UPSTREAM_PROVIDER_NOTE,
  OPEN_SOURCE_EXCLUSION_NOTICE,
} from "../../data/eu-ai-act-classifier/copy";
import type {
  AnswerSet,
  Article50Trigger,
  Article6_3Exception,
  GpaiObligationHolder,
  ModelResult,
  OpenSourceFlags,
  Result,
  ScopeStatus,
  SystemReason,
  SystemResult,
  Timing,
} from "../../data/eu-ai-act-classifier/types";
import { computeConfidence } from "./confidence";

// ── Internal draft type ──────────────────────────────────────────────────

interface Draft {
  system_result: SystemResult | null;
  system_reasons: SystemReason[];
  terminated: boolean;
  article_6_3_exception: Article6_3Exception;
  article_50_transparency_triggers: Article50Trigger[];
  model_result: ModelResult;
  gpai_obligation_holder: GpaiObligationHolder;
  gpai_open_source_exception: boolean;
  scope_status: ScopeStatus;
  deployer_obligation_exempt: boolean;
  open_source: OpenSourceFlags;
  timing: Timing;
  post_classification_notes: string[];
  unsure_fields: string[];
  annex_iii_match: boolean;
  matched_annex_iii_categories: string[];
}

function emptyDraft(): Draft {
  return {
    system_result: null,
    system_reasons: [],
    terminated: false,
    article_6_3_exception: {
      checked: false,
      applies: false,
      provider_documentation_required: false,
      registration_required_art_49_2: false,
    },
    article_50_transparency_triggers: [],
    model_result: "none",
    gpai_obligation_holder: "not_applicable",
    gpai_open_source_exception: false,
    scope_status: "in_scope",
    deployer_obligation_exempt: false,
    open_source: { flagged: false, exclusion_applies: false, exclusion_article: null },
    timing: {
      compliance_deadline: "2026-08-02",
      rules_enforceable_now: false,
      legacy_system: false,
      significant_change_detected: false,
      public_authority_deadline: null,
      gpai_legacy_deadline: null,
      annex_i_extended_deadline: null,
    },
    post_classification_notes: [],
    unsure_fields: [],
    annex_iii_match: false,
    matched_annex_iii_categories: [],
  };
}

// ── Step reducers ────────────────────────────────────────────────────────

function runStep0(answers: AnswerSet, draft: Draft): void {
  const a = answers.is_ai_system;
  if (a === "no") {
    draft.system_result = "not_ai_system";
    draft.scope_status = "out_of_scope";
    draft.terminated = true;
    draft.system_reasons.push({
      code: "not_ai_system",
      label: "Not an AI system under Article 3(1)",
      legal_ref: "Art. 3(1)",
      plain_explanation:
        "Your software does not infer from inputs how to generate outputs, so it does not meet the statutory definition of an AI system.",
    });
  }
}

function runStep1(answers: AnswerSet, draft: Draft): void {
  if (draft.terminated) return;

  const exits: Array<{ field: string; expect: "yes" | "no"; code: string; label: string; ref: string; expl: string }> = [
    {
      field: "eu_nexus",
      expect: "no",
      code: "no_eu_nexus",
      label: "No EU nexus",
      ref: "Art. 2(1)",
      expl:
        "The system will not be placed on the EU market, put into service in the EU, or produce outputs used in the EU.",
    },
    {
      field: "military_defence_exclusion",
      expect: "yes",
      code: "military_exclusion",
      label: "Military or defence exclusion",
      ref: "Art. 2(3)",
      expl: "The system is used exclusively for military, defence, or national security purposes.",
    },
    {
      field: "third_country_public_authority",
      expect: "yes",
      code: "third_country_exclusion",
      label: "Third-country public authority exclusion",
      ref: "Art. 2(4)",
      expl: "The system is used exclusively by a third-country public authority under an international cooperation agreement.",
    },
    {
      field: "scientific_rnd_only",
      expect: "yes",
      code: "scientific_rnd_exclusion",
      label: "Scientific R&D exclusion",
      ref: "Art. 2(6)",
      expl: "The system is used solely for scientific research and development and will not reach production.",
    },
    {
      field: "premarket_testing_only",
      expect: "yes",
      code: "premarket_exclusion",
      label: "Pre-market testing exclusion",
      ref: "Art. 2(8)",
      expl: "The system is only being tested and is not exposed to real people outside the development team.",
    },
  ];

  for (const e of exits) {
    if (answers[e.field] === e.expect) {
      draft.system_result = "out_of_scope";
      draft.scope_status = "out_of_scope";
      draft.terminated = true;
      draft.system_reasons.push({
        code: e.code,
        label: e.label,
        legal_ref: e.ref,
        plain_explanation: e.expl,
      });
      return;
    }
  }

  // personal_nonprofessional is a deployer-only exemption (v1.1 correction).
  // DOES NOT terminate — system remains in scope for provider obligations.
  if (answers.personal_nonprofessional === "yes") {
    draft.deployer_obligation_exempt = true;
  }

  // free_open_source is flagged here; conversion rule runs post-Step-6.
  if (answers.free_open_source === "yes") {
    draft.open_source.flagged = true;
  }
}

function runStep2(answers: AnswerSet, draft: Draft): void {
  if (draft.terminated) return;

  const step2 = CLASSIFIER_SCHEMA.steps.find((s) => s.id === "step2");
  const practices = step2?.prohibitedPractices ?? [];

  for (const p of practices) {
    if (answers[p.id] !== "yes") continue;
    // Check whether any exception is met
    let exceptionMet = false;
    for (const exc of p.exceptions) {
      if (answers[exc.id] === "yes") {
        exceptionMet = true;
        break;
      }
    }
    if (!exceptionMet) {
      draft.system_result = "prohibited";
      draft.terminated = true;
      draft.system_reasons.push({
        code: p.id,
        label: p.name,
        legal_ref: p.legal.article,
        plain_explanation: p.summary,
      });
      return;
    }
  }
}

function runStep3(answers: AnswerSet, draft: Draft): void {
  if (draft.terminated) return;
  if (answers.is_safety_component_or_product !== "yes") return;

  const covered = answers.covered_by_annex_i_legislation;
  if (typeof covered !== "string" || covered === "none" || covered === "") return;

  const third = answers.requires_third_party_conformity;
  if (third === "yes") {
    draft.system_result = "high_risk_annex_i";
    draft.system_reasons.push({
      code: "high_risk_annex_i",
      label: "High-risk under Annex I product safety",
      legal_ref: "Art. 6(1), Annex I",
      plain_explanation:
        "Your AI system is a safety component of, or is itself, a product covered by Annex I legislation that requires third-party conformity assessment before market placement.",
    });
  }
}

// Maps exclusion gates to the specific sub-use-cases they exclude from high-risk.
const EXCLUSION_GATE_MAP: Record<string, string[]> = {
  bio_verification_only: ["bio_remote_identification"],
  svc_financial_fraud_only: ["svc_creditworthiness"],
  mig_travel_doc_only: ["mig_identification"],
  justice_campaign_admin_only: ["justice_elections"],
};

function runStep4(answers: AnswerSet, draft: Draft): void {
  if (draft.terminated) return;

  const step4 = CLASSIFIER_SCHEMA.steps.find((s) => s.id === "step4_tier1");
  const domains = step4?.domains ?? [];

  const excludedSubUseCases = new Set<string>();
  for (const [gate, excluded] of Object.entries(EXCLUSION_GATE_MAP)) {
    if (answers[gate] === "yes") {
      for (const id of excluded) excludedSubUseCases.add(id);
    }
  }

  for (const domain of domains) {
    for (const suc of domain.subUseCases) {
      if (suc.isExclusionGate) continue; // gates themselves are not use cases
      if (answers[suc.id] !== "yes") continue;
      if (excludedSubUseCases.has(suc.id)) continue;

      draft.annex_iii_match = true;
      if (!draft.matched_annex_iii_categories.includes(domain.id)) {
        draft.matched_annex_iii_categories.push(domain.id);
      }
      draft.system_reasons.push({
        code: `annex_iii_${suc.id}`,
        label: suc.label,
        legal_ref: `Annex III, ${suc.annexRef}`,
        plain_explanation: suc.helper,
      });
    }
  }
}

function runStep5(answers: AnswerSet, draft: Draft): void {
  if (draft.terminated) return;
  if (!draft.annex_iii_match) return;
  // If already high_risk_annex_i, that classification dominates; no need to re-test.
  if (draft.system_result === "high_risk_annex_i") return;

  draft.article_6_3_exception.checked = true;

  // Profiling is the absolute blocker (Art. 6(3) final subparagraph)
  if (answers.profiles_natural_persons === "yes") {
    draft.article_6_3_exception.applies = false;
    draft.article_6_3_exception.reason =
      "System profiles natural persons — profiling blocks the Art. 6(3) exception.";
    draft.system_result = "high_risk_annex_iii";
    return;
  }

  if (answers.significant_risk_of_harm === "yes") {
    draft.article_6_3_exception.applies = false;
    draft.article_6_3_exception.reason =
      "System poses significant risk of harm to health, safety, or fundamental rights.";
    draft.system_result = "high_risk_annex_iii";
    return;
  }

  if (answers.material_influence_on_decision === "yes") {
    draft.article_6_3_exception.applies = false;
    draft.article_6_3_exception.reason =
      "System materially influences decisions about people.";
    draft.system_result = "high_risk_annex_iii";
    return;
  }

  const limb = answers.exception_limb;
  const validLimbs = [
    "narrow_procedural_task",
    "improves_completed_human_activity",
    "pattern_detection_no_replacement",
    "preparatory_task",
  ];

  if (typeof limb === "string" && validLimbs.includes(limb)) {
    // Exception succeeds — system exits high-risk. Leave system_result null so
    // Step 6 can decide limited_risk_transparency or minimal_risk.
    draft.article_6_3_exception.applies = true;
    draft.article_6_3_exception.provider_documentation_required = true;
    draft.article_6_3_exception.registration_required_art_49_2 = true;
    draft.post_classification_notes.push(ART_6_3_EXCEPTION_SUCCESS_NOTE);
  } else {
    draft.article_6_3_exception.applies = false;
    draft.article_6_3_exception.reason =
      "None of the Art. 6(3)(a)-(d) limbs apply.";
    draft.system_result = "high_risk_annex_iii";
  }
}

function runStep6(answers: AnswerSet, draft: Draft): void {
  // ALWAYS runs, per v1.1 correction. Populates triggers[] even for prohibited /
  // high-risk. Only promotes system_result if none has been set yet.
  const triggers: Article50Trigger[] = [];

  if (answers.interacts_directly_with_people === "yes") {
    triggers.push({
      trigger: "interacts_directly_with_people",
      article: "Art. 50(1)",
      obligation: "People must be informed they are interacting with AI.",
    });
  }

  if (
    answers.generates_synthetic_content === "yes" &&
    answers.standard_editing_exception !== "yes"
  ) {
    triggers.push({
      trigger: "generates_synthetic_content",
      article: "Art. 50(2)",
      obligation:
        "AI-generated content must be marked in a machine-readable format and detectable as artificial.",
    });
  }

  if (answers.emotion_recognition_or_biometric_cat === "yes") {
    triggers.push({
      trigger: "emotion_recognition_or_biometric_cat",
      article: "Art. 50(3)",
      obligation:
        "People must be informed when emotion recognition or biometric categorisation is applied to them.",
    });
  }

  if (answers.generates_deepfakes === "yes") {
    triggers.push({
      trigger: "generates_deepfakes",
      article: "Art. 50(4)",
      obligation:
        "Deep fake content must be disclosed as artificially generated or manipulated.",
    });
  }

  if (
    answers.ai_generated_public_interest_text === "yes" &&
    answers.public_interest_text_human_review_exception !== "yes"
  ) {
    triggers.push({
      trigger: "ai_generated_public_interest_text",
      article: "Art. 50(4)",
      obligation:
        "AI-generated public-interest text must be labelled as artificially generated, unless a human editor holds editorial responsibility.",
    });
  }

  draft.article_50_transparency_triggers = triggers;

  // Only promote to limited_risk_transparency / minimal_risk if no prior classification
  if (draft.terminated || draft.system_result) return;

  draft.system_result = triggers.length > 0 ? "limited_risk_transparency" : "minimal_risk";
}

function runStep6bOpenSourceConversion(_answers: AnswerSet, draft: Draft): void {
  if (!draft.open_source.flagged) return;
  // Conversion only applies to minimal_risk with no Art. 50 triggers.
  if (draft.system_result !== "minimal_risk") return;
  if (draft.article_50_transparency_triggers.length > 0) return;

  draft.system_result = "out_of_scope";
  draft.scope_status = "excluded_under_art_2_12";
  draft.open_source.exclusion_applies = true;
  draft.open_source.exclusion_article = "Art. 2(12)";
}

function runStep7(answers: AnswerSet, draft: Draft): void {
  const target = answers.assessment_target;
  if (target !== "model_only" && target !== "both") {
    draft.model_result = "none";
    draft.gpai_obligation_holder = "not_applicable";
    return;
  }

  if (answers.is_gpai_model !== "yes") {
    draft.model_result = "none";
    draft.gpai_obligation_holder = "not_applicable";
    return;
  }

  // Classification — based purely on model characteristics (v1.1 correction)
  const systemicTrigger =
    answers.training_compute_above_threshold === "yes" ||
    answers.commission_designated_systemic === "yes";
  const rebutted = answers.commission_rebuttal_accepted === "yes";

  draft.model_result = systemicTrigger && !rebutted ? "gpai_systemic_risk" : "gpai";

  // Obligation holder — separate from classification (v1.1 correction)
  if (answers.provider_placing_on_eu_market === "yes") {
    draft.gpai_obligation_holder = "self";
  } else {
    draft.gpai_obligation_holder = "upstream_provider";
    draft.post_classification_notes.push(GPAI_UPSTREAM_PROVIDER_NOTE);
  }

  // Open-source exception (Art. 53(2)) — only for non-systemic-risk models
  if (answers.gpai_open_source === "yes" && draft.model_result === "gpai") {
    draft.gpai_open_source_exception = true;
  }
}

function runStep8Timing(answers: AnswerSet, draft: Draft): void {
  let deadline = "2026-08-02"; // default: Annex III / Art. 50
  if (draft.system_result === "high_risk_annex_i") {
    deadline = "2027-08-02";
    draft.timing.annex_i_extended_deadline = "2027-08-02";
  }
  if (draft.system_result === "prohibited") {
    deadline = "2025-02-02";
    draft.timing.rules_enforceable_now = true;
  }

  draft.timing.compliance_deadline = deadline;

  // Past deadlines are enforceable now
  if (new Date(deadline) <= new Date()) {
    draft.timing.rules_enforceable_now = true;
  }

  if (answers.placed_on_market_before_2026_08_02 === "yes") {
    draft.timing.legacy_system = true;
    if (answers.significant_design_change_after_cutoff === "yes") {
      draft.timing.significant_change_detected = true;
    }
  }

  // Public authority legacy: 2030 deadline applies only if legacy and no significant change
  const isHighRisk =
    draft.system_result === "high_risk_annex_i" ||
    draft.system_result === "high_risk_annex_iii";
  if (
    answers.intended_for_public_authority_use === "yes" &&
    isHighRisk &&
    draft.timing.legacy_system &&
    !draft.timing.significant_change_detected
  ) {
    draft.timing.public_authority_deadline = "2030-08-02";
  }

  if (answers.gpai_on_market_before_2025_08_02 === "yes" && draft.model_result !== "none") {
    draft.timing.gpai_legacy_deadline = "2027-08-02";
  }
}

function runPostClassification(_answers: AnswerSet, draft: Draft): void {
  if (draft.deployer_obligation_exempt) {
    draft.post_classification_notes.push(DEPLOYER_EXEMPT_NOTICE);
  }
  if (draft.scope_status === "excluded_under_art_2_12") {
    draft.post_classification_notes.push(OPEN_SOURCE_EXCLUSION_NOTICE);
  }
  if (draft.system_result) {
    const obligations = CLASSIFIER_SCHEMA.obligationsTemplates[draft.system_result] ?? [];
    draft.post_classification_notes.push(...obligations);
  }
}

// ── Public API ────────────────────────────────────────────────────────────

export function classify(answers: AnswerSet): Result {
  const draft = emptyDraft();

  // Track "unsure" answers across all fields
  for (const [key, value] of Object.entries(answers)) {
    if (value === "unsure") draft.unsure_fields.push(key);
  }

  runStep0(answers, draft);
  runStep1(answers, draft);
  runStep2(answers, draft);
  runStep3(answers, draft);
  runStep4(answers, draft);
  runStep5(answers, draft);
  runStep6(answers, draft);
  runStep6bOpenSourceConversion(answers, draft);
  runStep7(answers, draft);
  runStep8Timing(answers, draft);
  runPostClassification(answers, draft);

  const system_result: SystemResult = draft.system_result ?? "minimal_risk";

  const partialResult: Result = {
    system_result,
    system_reasons: draft.system_reasons,
    matched_annex_iii_categories: draft.matched_annex_iii_categories,
    article_6_3_exception: draft.article_6_3_exception,
    article_50_transparency_triggers: draft.article_50_transparency_triggers,
    model_result: draft.model_result,
    gpai_obligation_holder: draft.gpai_obligation_holder,
    gpai_open_source_exception: draft.gpai_open_source_exception,
    scope_status: draft.scope_status,
    deployer_obligation_exempt: draft.deployer_obligation_exempt,
    open_source: draft.open_source,
    timing: draft.timing,
    confidence: "clear_match", // placeholder, overwritten below
    post_classification_notes: draft.post_classification_notes,
    unsure_fields: draft.unsure_fields,
  };

  partialResult.confidence = computeConfidence(answers, partialResult);
  return partialResult;
}
