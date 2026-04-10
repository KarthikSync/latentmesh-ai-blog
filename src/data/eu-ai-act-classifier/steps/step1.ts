// Step 1 — Scope gate (Art. 2)
// Beginner-facing copy: "SCOPE" — 7 exclusion cards, each with a short
// consequence. personal_nonprofessional is a deployer-only flag (v1.1
// correction) and free_open_source is evaluated post-Step-6 (v1.3 rule);
// both still continue the assessment even when ticked.

import type { StepDef } from "../types";

export const STEP_1: StepDef = {
  id: "step1",
  title: "Does the EU AI Act apply to this system?",
  shortLabel: "Scope",
  intro:
    "Some AI systems are outside the scope of the Act. We'll check those exclusions first.",
  questions: [
    {
      id: "eu_nexus",
      step: "step1",
      order: 0,
      type: "yes_no",
      prompt:
        "Will this AI system be placed on the market, put into service, or have its outputs used in the EU?",
      helper: "If not, the EU AI Act does not apply.",
      why:
        "The Act applies to providers placing systems on the EU market, deployers within the EU, and third-country actors whose system outputs are used in the EU.",
      legal: { article: "Art. 2(1)" },
    },
    {
      id: "military_defence_exclusion",
      step: "step1",
      order: 1,
      type: "yes_no",
      prompt:
        "Is this system developed or used exclusively for military, defence, or national security purposes?",
      helper: "If yes, the EU AI Act does not apply.",
      why:
        "Exclusively military, defence, or national security uses are fully excluded from the Act.",
      legal: { article: "Art. 2(3)" },
    },
    {
      id: "third_country_public_authority",
      step: "step1",
      order: 2,
      type: "yes_no",
      prompt:
        "Is this system used exclusively by a public authority in a third country under an international cooperation agreement with the EU for law enforcement or judicial cooperation?",
      helper: "If yes, the EU AI Act does not apply.",
      why:
        "A narrow exclusion for non-EU governments operating under specific treaties with the EU.",
      legal: { article: "Art. 2(4)" },
    },
    {
      id: "scientific_rnd_only",
      step: "step1",
      order: 3,
      type: "yes_no",
      prompt:
        "Is this system used solely for scientific research and development, and not placed on the market or put into service?",
      helper: "If yes, the EU AI Act does not apply.",
      why:
        "Pure research that will never reach production or end users is excluded.",
      legal: { article: "Art. 2(6)" },
    },
    {
      id: "premarket_testing_only",
      step: "step1",
      order: 4,
      type: "yes_no",
      prompt:
        "Is this system used only for testing, development, or pre-market evaluation, and not for real-world use outside the development team?",
      helper: "If yes, the EU AI Act does not apply.",
      why:
        "Controlled pre-market testing that does not affect real people is excluded until the system is deployed for actual users.",
      legal: { article: "Art. 2(8)" },
    },
    {
      id: "personal_nonprofessional",
      step: "step1",
      order: 5,
      type: "yes_no",
      prompt:
        "Is this AI used only for personal, non-professional activity, such as a hobby project with no commercial use?",
      helper:
        "If yes, deployer obligations do not apply to you as a private individual. Provider obligations still apply to whoever built the system.",
      why:
        "Article 2(10) exempts natural persons using AI for purely personal, non-professional activity from deployer obligations. It does not remove the system itself from scope.",
      legal: { article: "Art. 2(10)" },
    },
    {
      id: "free_open_source",
      step: "step1",
      order: 6,
      type: "yes_no",
      prompt:
        "Is this AI released under a free and open-source licence that allows users to access, use, modify, and redistribute it?",
      helper:
        "This helps determine whether open-source exceptions may apply in later steps. Monetised systems or those that require paid support may not qualify.",
      why:
        "Open-source AI can benefit from a conditional exclusion under Art. 2(12), but only after classification shows it is not high-risk, prohibited, or subject to transparency duties.",
      legal: { article: "Art. 2(12)", recital: "Recital 103" },
    },
  ],
};
