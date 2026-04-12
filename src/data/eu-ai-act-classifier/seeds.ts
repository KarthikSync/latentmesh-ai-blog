// Canonical test scenarios. Each seed maps to one of the five verification
// paths in the plan file, covering the main drift resolutions so a dev can
// jump straight to a known-good end state via ?seed=<id>.

import type { AnswerSet } from "./types";

export interface Seed {
  id: string;
  name: string;
  description: string;
  expectedSystemResult: string;
  answers: AnswerSet;
  // Post-classification state for the obligation list (optional — if set,
  // the result screen pre-fills these so the obligation list renders
  // immediately without manual clicks).
  role?: string; // "Provider" | "Deployer" | "Both"
  substantiallyModified?: boolean;
}

// Baseline: "in scope, nothing triggered, no GPAI" — individual seeds only
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
  selected_domains: [],
  interacts_directly_with_people: "no",
  generates_synthetic_content: "no",
  emotion_recognition_or_biometric_cat: "no",
  generates_deepfakes: "no",
  ai_generated_public_interest_text: "no",
  assessment_target: "system_only",
};

export const SEEDS: Seed[] = [
  {
    id: "happy-high-risk-employment",
    name: "High-risk: recruitment with profiling",
    description:
      "Annex III employment sub-use-case + profiling blocker → high_risk_annex_iii, deadline 2026-08-02.",
    expectedSystemResult: "high_risk_annex_iii",
    role: "Provider",
    substantiallyModified: false,
    answers: {
      ...baseline,
      selected_domains: ["employment"],
      emp_recruitment: "yes",
      profiles_natural_persons: "yes",
    },
  },
  {
    id: "art-6-3-exception-success",
    name: "Art. 6(3) exception success",
    description:
      "Annex III path, no profiling, no significant risk, narrow procedural task → exception applies, result stays limited_risk or minimal.",
    expectedSystemResult: "minimal_risk",
    role: "Provider",
    substantiallyModified: false,
    answers: {
      ...baseline,
      selected_domains: ["employment"],
      emp_recruitment: "yes",
      profiles_natural_persons: "no",
      significant_risk_of_harm: "no",
      material_influence_on_decision: "no",
      exception_limb: "narrow_procedural_task",
    },
  },
  {
    id: "art-2-12-open-source",
    name: "Open-source Art. 2(12) conversion",
    description:
      "free_open_source + minimal risk + no Art. 50 triggers → out_of_scope under Art. 2(12).",
    expectedSystemResult: "out_of_scope",
    answers: {
      ...baseline,
      free_open_source: "yes",
    },
  },
  {
    id: "gpai-upstream-provider",
    name: "GPAI upstream provider",
    description:
      "Minimal system + GPAI model via API → model_result=gpai with upstream_provider obligations, system stays minimal.",
    expectedSystemResult: "minimal_risk",
    answers: {
      ...baseline,
      assessment_target: "both",
      is_gpai_model: "yes",
      provider_placing_on_eu_market: "no",
      gpai_open_source: "no",
      training_compute_above_threshold: "no",
      commission_designated_systemic: "no",
    },
  },
  {
    id: "personal-non-professional",
    name: "Personal / non-professional",
    description:
      "Art. 2(10) — deployer obligation exemption flagged but assessment continues; final result is NOT out_of_scope.",
    expectedSystemResult: "minimal_risk",
    answers: {
      ...baseline,
      personal_nonprofessional: "yes",
    },
  },
];

export function findSeed(id: string): Seed | null {
  return SEEDS.find((s) => s.id === id) ?? null;
}
