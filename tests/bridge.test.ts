import { describe, expect, it } from "vitest";
import {
  buildDisplayContext,
  buildModelProfile,
  buildSystemProfile,
  computeDisplayEffectiveFrom,
  extractAnnexCategories,
  mapTriggerToConditionId,
  translateRiskLevel,
  translateRole,
} from "../src/lib/eu-ai-act-classifier/bridge";
import { classify } from "../src/lib/eu-ai-act-classifier/engine";
import type { AnswerSet } from "../src/data/eu-ai-act-classifier/types";
import type { ObligationRecord } from "../src/data/eu-ai-act-classifier/obligation-types";

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

describe("translateRiskLevel", () => {
  it("maps high_risk_annex_iii to high_risk", () => {
    expect(translateRiskLevel("high_risk_annex_iii")).toBe("high_risk");
  });

  it("maps high_risk_annex_i to high_risk", () => {
    expect(translateRiskLevel("high_risk_annex_i")).toBe("high_risk");
  });

  it("maps prohibited to unacceptable", () => {
    expect(translateRiskLevel("prohibited")).toBe("unacceptable");
  });

  it("maps limited_risk_transparency to limited_risk", () => {
    expect(translateRiskLevel("limited_risk_transparency")).toBe("limited_risk");
  });

  it("maps minimal_risk to minimal_risk", () => {
    expect(translateRiskLevel("minimal_risk")).toBe("minimal_risk");
  });

  it("returns null for not_ai_system", () => {
    expect(translateRiskLevel("not_ai_system")).toBe(null);
  });

  it("returns null for out_of_scope", () => {
    expect(translateRiskLevel("out_of_scope")).toBe(null);
  });
});

describe("extractAnnexCategories", () => {
  it("extracts employment from a high-risk employment result", () => {
    const result = classify({ ...baseline, emp_recruitment: "yes", profiles_natural_persons: "yes" });
    const categories = extractAnnexCategories(result);
    expect(categories).toContain("employment");
    expect(categories).not.toContain("biometrics");
  });

  it("returns empty array for minimal_risk result", () => {
    const result = classify(baseline);
    expect(extractAnnexCategories(result)).toEqual([]);
  });
});

describe("translateRole", () => {
  it("maps Provider to ['provider']", () => {
    expect(translateRole("Provider")).toEqual(["provider"]);
  });

  it("maps Deployer to ['deployer']", () => {
    expect(translateRole("Deployer")).toEqual(["deployer"]);
  });

  it("maps Both to ['provider', 'deployer'] (union)", () => {
    expect(translateRole("Both")).toEqual(["provider", "deployer"]);
  });

  it("returns empty array for unknown values", () => {
    expect(translateRole("")).toEqual([]);
  });
});

describe("mapTriggerToConditionId", () => {
  it("maps our engine trigger names to obligation schema condition IDs", () => {
    expect(mapTriggerToConditionId("interacts_directly_with_people")).toBe("system_interacts_with_natural_persons");
    expect(mapTriggerToConditionId("emotion_recognition_or_biometric_cat")).toBe("system_categorises_biometrically");
    expect(mapTriggerToConditionId("generates_deepfakes")).toBe("system_generates_synthetic_content");
    expect(mapTriggerToConditionId("ai_generated_public_interest_text")).toBe("system_generates_text_published_as_news");
  });
});

describe("buildSystemProfile", () => {
  it("assembles a complete system profile from a high-risk result", () => {
    const result = classify({ ...baseline, emp_recruitment: "yes", profiles_natural_persons: "yes" });
    const profile = buildSystemProfile(result, "Provider");
    expect(profile.risk_level).toBe("high_risk");
    expect(profile.annex_iii_categories).toContain("employment");
    expect(profile.role).toEqual(["provider"]);
    expect(profile.applicable_frameworks).toEqual(["eu_ai_act"]);
    expect(profile.geography).toEqual(["EU"]);
    expect(profile.is_sme).toBe(null);
  });
});

describe("buildModelProfile", () => {
  it("assembles a model profile from a GPAI upstream result", () => {
    const result = classify({
      ...baseline,
      assessment_target: "both",
      is_gpai_model: "yes",
      provider_placing_on_eu_market: "no",
      training_compute_above_threshold: "no",
      commission_designated_systemic: "no",
    });
    const profile = buildModelProfile(result);
    expect(profile.model_result).toBe("gpai");
    expect(profile.gpai_obligation_holder).toBe("upstream_provider");
    expect(profile.gpai_open_source_exception).toBe(false);
  });
});

describe("computeDisplayEffectiveFrom", () => {
  const sampleObligation: ObligationRecord = {
    obligation_id: "test",
    obligation_track: "system",
    source_code: "Art. 14(1)",
    plain_language_requirement: "test",
    legal_source: { article: "14" },
    source_framework: "eu_ai_act",
    category: "human_oversight",
    effective_from: "2026-08-02",
    coverage_batch: "batch-1",
    record_version: "1.0",
    last_reviewed_at: "2026-04-12",
    review_status: "approved",
    priority_label: "high",
    priority_reason: "test",
    sanction_band: { max_fine_eur: 15_000_000, max_fine_turnover_pct: 3, band_label: "EUR 15M / 3%" },
    applies_to_roles: ["deployer"],
    delivery_scope: "system",
    applicability_conditions: { risk_levels: ["high_risk"] },
  };

  const baseTiming = {
    compliance_deadline: "2026-08-02",
    rules_enforceable_now: false,
    legacy_system: false,
    significant_change_detected: false,
    public_authority_deadline: null,
    gpai_legacy_deadline: null,
    annex_i_extended_deadline: null,
  };

  it("returns canonical date for normal system obligations", () => {
    const date = computeDisplayEffectiveFrom(sampleObligation, baseTiming, "high_risk_annex_iii");
    expect(date).toBe("2026-08-02");
  });

  it("uses annex_i_extended_deadline for Annex I systems", () => {
    const timing = { ...baseTiming, annex_i_extended_deadline: "2027-08-02" };
    const date = computeDisplayEffectiveFrom(sampleObligation, timing, "high_risk_annex_i");
    expect(date).toBe("2027-08-02");
  });

  it("uses public_authority_deadline for deployer obligations when present", () => {
    const timing = { ...baseTiming, public_authority_deadline: "2030-08-02" };
    const date = computeDisplayEffectiveFrom(sampleObligation, timing, "high_risk_annex_iii");
    expect(date).toBe("2030-08-02");
  });

  it("returns canonical date for model-track obligations (no overrides)", () => {
    const modelObligation = { ...sampleObligation, obligation_track: "model" as const };
    const timing = { ...baseTiming, annex_i_extended_deadline: "2027-08-02" };
    const date = computeDisplayEffectiveFrom(modelObligation, timing, "high_risk_annex_i");
    expect(date).toBe("2026-08-02"); // not overridden
  });
});
