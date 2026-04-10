// Step 8 — Timing overlay (Arts. 111, 113)
// Classification doesn't change, but the compliance deadline does.

import type { StepDef, TimingMilestone } from "../types";

export const STEP_8: StepDef = {
  id: "step8",
  title: "When do these rules apply to you?",
  shortLabel: "Timeline",
  intro:
    "Different parts of the Act became enforceable at different times. Your classification doesn't change, but the applicable deadline does.",
  questions: [
    {
      id: "placed_on_market_before_2026_08_02",
      step: "step8",
      order: 0,
      type: "yes_no",
      prompt:
        "Was this AI system already placed on the market or put into service before 2 August 2026?",
      why:
        "Systems already on the market before this date are treated as 'legacy' and follow a different compliance timeline.",
      legal: { article: "Art. 111(1)" },
    },
    {
      id: "significant_design_change_after_cutoff",
      step: "step8",
      order: 1,
      type: "yes_no",
      prompt:
        "Has the system undergone a significant change in design after the relevant application date?",
      why:
        "If yes, the system is treated as newly placed on the market, and full Chapter III obligations apply from the date of the change.",
      helper:
        "A 'significant change' means a change that affects the system's compliance with Chapter III requirements, or a modification to its assessed intended purpose.",
      legal: { article: "Art. 111(1)" },
      showIf: (a) => a.placed_on_market_before_2026_08_02 === "yes",
    },
    {
      id: "intended_for_public_authority_use",
      step: "step8",
      order: 2,
      type: "yes_no",
      prompt:
        "Will this high-risk system be used by a public authority (government, municipality, public institution)?",
      why:
        "Public authority legacy systems have an extended deadline of 2 August 2030 under Art. 111(2).",
      legal: { article: "Art. 111(2)" },
    },
    {
      id: "gpai_on_market_before_2025_08_02",
      step: "step8",
      order: 3,
      type: "yes_no",
      prompt:
        "Was this GPAI model already placed on the market before 2 August 2025?",
      why:
        "Providers of legacy GPAI models have until 2 August 2027 to comply with Articles 53 and 55.",
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
