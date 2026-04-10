// Step 8 — Timing overlay (Arts. 111, 113)
// Beginner-facing copy: "TIMELINE" — 4 questions rewritten in the tighter
// voice. Classification does not change, but the applicable deadline may.

import type { StepDef, TimingMilestone } from "../types";

export const STEP_8: StepDef = {
  id: "step8",
  title: "When do these rules apply?",
  shortLabel: "Timeline",
  intro:
    "Your classification does not change, but the compliance deadline may. We'll check the relevant timeline.",
  questions: [
    {
      id: "placed_on_market_before_2026_08_02",
      step: "step8",
      order: 0,
      type: "yes_no",
      prompt:
        "Was this AI system already placed on the market or put into service before 2 August 2026?",
      helper:
        "In plain terms, was it already live, deployed, or commercially available before that date?",
      why:
        "If yes, this system is treated as 'legacy' and follows a different compliance timeline.",
      legal: { article: "Art. 111(1)" },
    },
    {
      id: "significant_design_change_after_cutoff",
      step: "step8",
      order: 1,
      type: "yes_no",
      prompt: "Has the system undergone a significant design change since then?",
      helper:
        "A significant change is one that affects compliance with Chapter III requirements, or modifies the system's assessed intended purpose.",
      why:
        "If yes, the system is treated as newly placed on the market, and full obligations apply from the date of change.",
      legal: { article: "Art. 111(1)" },
      showIf: (a) => a.placed_on_market_before_2026_08_02 === "yes",
    },
    {
      id: "intended_for_public_authority_use",
      step: "step8",
      order: 2,
      type: "yes_no",
      prompt: "Will this high-risk system be used by a public authority?",
      helper:
        "For some legacy high-risk systems used by public authorities, a later deadline may apply.",
      why:
        "If yes, and the system is legacy with no significant change, the compliance deadline may be extended to 2 August 2030.",
      legal: { article: "Art. 111(2)" },
    },
    {
      id: "gpai_on_market_before_2025_08_02",
      step: "step8",
      order: 3,
      type: "yes_no",
      prompt:
        "Was this GPAI model already placed on the market before 2 August 2025?",
      helper:
        "GPAI model obligations have been enforceable since 2 August 2025. Legacy models have a separate compliance timeline.",
      why:
        "If yes, the provider has until 2 August 2027 to comply with Articles 53 and 55.",
      legal: { article: "Art. 111(3)" },
      showIf: (a) =>
        a.assessment_target === "model_only" || a.assessment_target === "both",
    },
  ],
};

export const TIMING_MILESTONES: TimingMilestone[] = [
  {
    id: "prohibited_enforced",
    label: "Prohibited practices + AI literacy",
    date: "2025-02-02",
    status: "enforceable",
  },
  {
    id: "gpai_enforced",
    label: "GPAI model obligations",
    date: "2025-08-02",
    status: "enforceable",
  },
  {
    id: "high_risk_annex_iii",
    label: "High-risk (Annex III) + Art. 50 transparency",
    date: "2026-08-02",
    status: "upcoming",
  },
  {
    id: "high_risk_annex_i",
    label: "High-risk systems in regulated products (Annex I)",
    date: "2027-08-02",
    status: "future",
  },
  {
    id: "public_authority_legacy",
    label: "Public authority legacy systems",
    date: "2030-08-02",
    status: "future",
  },
];
