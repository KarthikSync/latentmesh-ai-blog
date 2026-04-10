// Confidence tier tests — 5 cases covering every ambiguity source.

import { describe, expect, it } from "vitest";
import { classify } from "../src/lib/eu-ai-act-classifier/engine";
import type { AnswerSet } from "../src/data/eu-ai-act-classifier/types";

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

describe("computeConfidence (via classify)", () => {
  it("1. clean yes/no path → clear_match", () => {
    const r = classify(baseline);
    expect(r.confidence).toBe("clear_match");
  });

  it("2. single 'unsure' answer → likely_match", () => {
    const r = classify({ ...baseline, is_ai_system: "unsure" });
    expect(r.confidence).toBe("likely_match");
  });

  it("3. two 'unsure' answers → ambiguous_consult_legal", () => {
    const r = classify({
      ...baseline,
      is_ai_system: "unsure",
      training_compute_above_threshold: "unsure",
    });
    expect(r.confidence).toBe("ambiguous_consult_legal");
  });

  it("4. Art. 6(3) exception succeeded → likely_match (inherent ambiguity)", () => {
    const r = classify({
      ...baseline,
      emp_recruitment: "yes",
      profiles_natural_persons: "no",
      significant_risk_of_harm: "no",
      material_influence_on_decision: "no",
      exception_limb: "narrow_procedural_task",
    });
    expect(r.article_6_3_exception.applies).toBe(true);
    expect(r.confidence).toBe("likely_match");
  });

  it("5. free_open_source + single Art. 50 trigger → ambiguous_consult_legal (Art. 2(12) near-miss, drift #6)", () => {
    const r = classify({
      ...baseline,
      free_open_source: "yes",
      interacts_directly_with_people: "yes",
    });
    expect(r.system_result).toBe("limited_risk_transparency");
    expect(r.article_50_transparency_triggers.length).toBe(1);
    expect(r.confidence).toBe("ambiguous_consult_legal");
  });
});
