// Step 1 — Scope gate (Art. 2)
// Seven exclusion fields. Note: personal_nonprofessional is a deployer-only exemption
// (v1.1 correction), not a scope exit. free_open_source is a flag evaluated post-Step-6.

import type { StepDef } from "../types";

export const STEP_1: StepDef = {
  id: "step1",
  title: "Does the EU AI Act apply to you?",
  shortLabel: "Scope",
  intro:
    "Even if you have an AI system, several exclusions can take you out of scope. We'll check them one at a time.",
  questions: [
    {
      id: "eu_nexus",
      step: "step1",
      order: 0,
      type: "yes_no",
      prompt:
        "Will this AI system be placed on the market, put into service, or have its outputs used within the EU or EEA?",
      why:
        "The Act applies to providers placing systems on the EU market, deployers within the EU, and third-country actors whose system outputs are used in the EU.",
      helper:
        "This includes: selling or licensing the system to EU customers, deploying it for EU-based users, or even running it outside the EU if the outputs affect people in the EU.",
      legal: { article: "Art. 2(1)" },
    },
    {
      id: "military_defence_exclusion",
      step: "step1",
      order: 1,
      type: "yes_no",
      prompt:
        "Is this system developed or used exclusively for military, defence, or national security purposes?",
      why: "These are fully excluded from the Act.",
      helper:
        "The keyword is 'exclusively.' If the system has any civilian application, this exclusion does not apply.",
      legal: { article: "Art. 2(3)" },
    },
    {
      id: "third_country_public_authority",
      step: "step1",
      order: 2,
      type: "yes_no",
      prompt:
        "Is this system used exclusively by a public authority in a third country under an international cooperation agreement with the EU for law enforcement or judicial cooperation?",
      why: "Certain third-country government uses are excluded.",
      helper:
        "This is a narrow exclusion for non-EU governments operating under specific treaties with the EU for law enforcement or judicial cooperation.",
      legal: { article: "Art. 2(4)" },
    },
    {
      id: "scientific_rnd_only",
      step: "step1",
      order: 3,
      type: "yes_no",
      prompt:
        "Is this system used solely for scientific research and development, and will never be placed on the market or put into service?",
      why: "Pure research AI that never reaches production or end-users is excluded.",
      helper:
        "If the system might eventually be placed on the market or put into service, this exclusion does not apply. 'Research only' means it stays in the lab.",
      legal: { article: "Art. 2(6)" },
    },
    {
      id: "premarket_testing_only",
      step: "step1",
      order: 4,
      type: "yes_no",
      prompt:
        "Is this system being used only for testing, development, or pre-market activities, and will not be exposed to real people outside the development team?",
      why:
        "Pre-market testing and development activities are excluded, provided the system is not affecting real people.",
      helper:
        "Testing within a controlled environment with no impact on real people is excluded. Once you run a pilot with real users, this exclusion no longer applies.",
      legal: { article: "Art. 2(8)" },
    },
    {
      id: "personal_nonprofessional",
      step: "step1",
      order: 5,
      type: "yes_no",
      prompt:
        "Are you a private individual using this AI system purely for personal, non-professional activity (e.g., a hobby project with no commercial use)?",
      why:
        "Article 2(10) exempts the deployer obligations of natural persons using AI for purely personal, non-professional activity. It does NOT take the system itself out of scope. If you are the provider (the company that built or markets the system), this exclusion does not apply to you even if your end-users are consumers.",
      helper:
        "If you're a hobbyist running AI for personal projects with no commercial or professional use, you're exempt from deployer obligations — but provider obligations on whoever built the system still apply.",
      legal: { article: "Art. 2(10)" },
    },
    {
      id: "free_open_source",
      step: "step1",
      order: 6,
      type: "yes_no",
      prompt:
        "Is this AI system released under a free and open-source licence that allows users to access, use, modify, and redistribute it?",
      why:
        "Open-source AI systems are generally excluded from the Act UNLESS they are high-risk (Annex I or III), prohibited (Art. 5), or have transparency obligations (Art. 50). This exclusion is checked again after classification.",
      helper:
        "Important: simply having a public repository does not automatically qualify. Recital 103 clarifies that systems where the AI component is monetised through support services, platform access, or commercial licensing may not meet the exclusion. The exclusion also does not apply where personal data is used for purposes beyond improving security, compatibility, or interoperability. Note: for GPAI models specifically, a separate and stricter openness test applies in Step 7.",
      legal: { article: "Art. 2(12)", recital: "Recital 103" },
    },
  ],
};
