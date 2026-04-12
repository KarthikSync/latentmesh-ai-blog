// Engine tests — 18 cases covering every terminal system_result and every
// v1.1+ drift resolution. No DOM, pure function calls.

import { describe, expect, it } from "vitest";
import { classify } from "../src/lib/eu-ai-act-classifier/engine";
import type { AnswerSet } from "../src/data/eu-ai-act-classifier/types";

// Shared baseline: "in scope, no issues" set so individual tests only need to
// override the fields they care about.
const baseline: AnswerSet = {
  is_ai_system: "yes",
  eu_nexus: "yes",
  military_defence_exclusion: "no",
  third_country_public_authority: "no",
  scientific_rnd_only: "no",
  premarket_testing_only: "no",
  personal_nonprofessional: "no",
  free_open_source: "no",
  prohibited_manipulation: "no",
  prohibited_vulnerability_exploitation: "no",
  prohibited_social_scoring: "no",
  prohibited_criminal_prediction: "no",
  prohibited_facial_scraping: "no",
  prohibited_emotion_workplace_education: "no",
  prohibited_biometric_categorisation: "no",
  prohibited_rbi_law_enforcement: "no",
  is_safety_component_or_product: "no",
  interacts_directly_with_people: "no",
  generates_synthetic_content: "no",
  emotion_recognition_or_biometric_cat: "no",
  generates_deepfakes: "no",
  ai_generated_public_interest_text: "no",
  assessment_target: "system_only",
};

describe("classify — terminal states", () => {
  it("1. is_ai_system=no → not_ai_system", () => {
    const r = classify({ ...baseline, is_ai_system: "no" });
    expect(r.system_result).toBe("not_ai_system");
    expect(r.scope_status).toBe("out_of_scope");
  });

  it("2. eu_nexus=no → out_of_scope", () => {
    const r = classify({ ...baseline, eu_nexus: "no" });
    expect(r.system_result).toBe("out_of_scope");
    expect(r.scope_status).toBe("out_of_scope");
  });

  it("3. personal_nonprofessional=yes continues, flags deployer exemption", () => {
    const r = classify({ ...baseline, personal_nonprofessional: "yes" });
    expect(r.system_result).not.toBe("out_of_scope");
    expect(r.deployer_obligation_exempt).toBe(true);
    expect(r.scope_status).toBe("in_scope");
    // Notes include the deployer-exempt explanation
    expect(
      r.post_classification_notes.some((n) =>
        n.toLowerCase().includes("personal, non-professional")
      )
    ).toBe(true);
  });

  it("4. prohibited practice with no exception → prohibited, Art. 50 triggers still recorded", () => {
    const r = classify({
      ...baseline,
      prohibited_manipulation: "yes",
      interacts_directly_with_people: "yes",
    });
    expect(r.system_result).toBe("prohibited");
    expect(r.article_50_transparency_triggers.length).toBeGreaterThan(0);
  });

  it("5. prohibited criminal prediction WITH exception → not prohibited", () => {
    const r = classify({
      ...baseline,
      prohibited_criminal_prediction: "yes",
      prohibited_criminal_prediction_exception: "yes",
    });
    expect(r.system_result).not.toBe("prohibited");
  });

  it("6. Annex I path with all three conditions → high_risk_annex_i with 2027 deadline", () => {
    const r = classify({
      ...baseline,
      is_safety_component_or_product: "yes",
      covered_by_annex_i_legislation: "medical_devices",
      requires_third_party_conformity: "yes",
    });
    expect(r.system_result).toBe("high_risk_annex_i");
    expect(r.timing.compliance_deadline).toBe("2027-08-02");
    expect(r.timing.annex_i_extended_deadline).toBe("2027-08-02");
  });

  it("7. Annex III employment + profiling → high_risk_annex_iii (profiling blocks exception)", () => {
    const r = classify({
      ...baseline,
      emp_recruitment: "yes",
      profiles_natural_persons: "yes",
    });
    expect(r.system_result).toBe("high_risk_annex_iii");
    expect(r.matched_annex_iii_categories).toContain("employment");
    expect(r.matched_annex_iii_categories).not.toContain("biometrics");
    expect(r.article_6_3_exception.applies).toBe(false);
    expect(r.article_6_3_exception.reason).toContain("profiling");
  });

  it("8. Art. 6(3) exception-success: documentation + Art. 49(2), NOT notify (drift #1)", () => {
    const r = classify({
      ...baseline,
      emp_recruitment: "yes",
      profiles_natural_persons: "no",
      significant_risk_of_harm: "no",
      material_influence_on_decision: "no",
      exception_limb: "narrow_procedural_task",
    });
    expect(r.article_6_3_exception.applies).toBe(true);
    expect(r.article_6_3_exception.provider_documentation_required).toBe(true);
    expect(r.article_6_3_exception.registration_required_art_49_2).toBe(true);
    const notesJoined = r.post_classification_notes.join(" ");
    expect(notesJoined).toMatch(/document/i);
    expect(notesJoined).toMatch(/49\(2\)/);
    expect(notesJoined).not.toMatch(/notify/i);
  });

  it("9. biometric verification only → NOT high-risk", () => {
    const r = classify({
      ...baseline,
      bio_verification_only: "yes",
      bio_remote_identification: "yes", // gets excluded by the gate
    });
    expect(r.system_result).not.toBe("high_risk_annex_iii");
  });

  it("10. creditworthiness + financial fraud only → NOT high-risk", () => {
    const r = classify({
      ...baseline,
      svc_creditworthiness: "yes",
      svc_financial_fraud_only: "yes",
    });
    expect(r.system_result).not.toBe("high_risk_annex_iii");
  });

  it("11. chatbot only → limited_risk_transparency with Art. 50(1) trigger", () => {
    const r = classify({
      ...baseline,
      interacts_directly_with_people: "yes",
    });
    expect(r.system_result).toBe("limited_risk_transparency");
    expect(
      r.article_50_transparency_triggers.some(
        (t) => t.trigger === "interacts_directly_with_people"
      )
    ).toBe(true);
  });

  it("12. no triggers, no high-risk, not prohibited → minimal_risk", () => {
    const r = classify(baseline);
    expect(r.system_result).toBe("minimal_risk");
    expect(r.article_50_transparency_triggers.length).toBe(0);
  });
});

describe("classify — open-source conversion (drift #4)", () => {
  it("13. free_open_source + minimal_risk + no triggers → out_of_scope (Art. 2(12))", () => {
    const r = classify({ ...baseline, free_open_source: "yes" });
    expect(r.system_result).toBe("out_of_scope");
    expect(r.scope_status).toBe("excluded_under_art_2_12");
    expect(r.open_source.exclusion_applies).toBe(true);
    expect(r.open_source.exclusion_article).toBe("Art. 2(12)");
  });

  it("14. free_open_source + Art. 50 trigger → stays limited_risk_transparency", () => {
    const r = classify({
      ...baseline,
      free_open_source: "yes",
      interacts_directly_with_people: "yes",
    });
    expect(r.system_result).toBe("limited_risk_transparency");
    expect(r.open_source.exclusion_applies).toBe(false);
  });

  it("15. free_open_source + high_risk_annex_iii → stays high-risk, no exclusion", () => {
    const r = classify({
      ...baseline,
      free_open_source: "yes",
      emp_recruitment: "yes",
      profiles_natural_persons: "yes",
    });
    expect(r.system_result).toBe("high_risk_annex_iii");
    expect(r.open_source.exclusion_applies).toBe(false);
  });
});

describe("classify — GPAI parallel track (drift #2)", () => {
  it("16. GPAI upstream provider: model_result=gpai, obligation_holder=upstream_provider", () => {
    const r = classify({
      ...baseline,
      assessment_target: "both",
      is_gpai_model: "yes",
      provider_placing_on_eu_market: "no",
      training_compute_above_threshold: "no",
      commission_designated_systemic: "no",
    });
    expect(r.model_result).toBe("gpai");
    expect(r.gpai_obligation_holder).toBe("upstream_provider");
    expect(
      r.post_classification_notes.some((n) => n.includes("upstream provider"))
    ).toBe(true);
  });

  it("17. GPAI systemic risk: open-source exception does NOT apply", () => {
    const r = classify({
      ...baseline,
      assessment_target: "both",
      is_gpai_model: "yes",
      provider_placing_on_eu_market: "yes",
      gpai_open_source: "yes",
      training_compute_above_threshold: "yes",
      commission_designated_systemic: "no",
      commission_rebuttal_accepted: "no",
    });
    expect(r.model_result).toBe("gpai_systemic_risk");
    expect(r.gpai_open_source_exception).toBe(false);
  });

  it("18. High-risk system + GPAI upstream + Art. 50 trigger → all three populated", () => {
    const r = classify({
      ...baseline,
      emp_recruitment: "yes",
      profiles_natural_persons: "yes",
      interacts_directly_with_people: "yes",
      assessment_target: "both",
      is_gpai_model: "yes",
      provider_placing_on_eu_market: "no",
      training_compute_above_threshold: "no",
      commission_designated_systemic: "no",
    });
    expect(r.system_result).toBe("high_risk_annex_iii");
    expect(r.model_result).toBe("gpai");
    expect(r.gpai_obligation_holder).toBe("upstream_provider");
    expect(r.article_50_transparency_triggers.length).toBeGreaterThan(0);
  });
});
