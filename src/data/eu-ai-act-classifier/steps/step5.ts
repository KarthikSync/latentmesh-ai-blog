// Step 5 — Article 6(3) exception test
// Only reached when annex_iii_match == true. Profiling is an absolute blocker.
// Exception succeeds only when the three threshold conditions are all false
// AND at least one of the four Art. 6(3)(a)-(d) limbs is true.

import type { StepDef } from "../types";

export const STEP_5: StepDef = {
  id: "step5",
  title: "Your system matches an Annex III use case — but it might not be high-risk",
  shortLabel: "Exception",
  intro:
    "The EU AI Act has a safety valve. Even if your system falls under Annex III, it's NOT considered high-risk if it meets ALL of these conditions. Let's check them.",
  questions: [
    {
      id: "profiles_natural_persons",
      step: "step5",
      order: 0,
      type: "yes_no",
      prompt:
        "Does this system perform profiling of natural persons — automatically processing personal data to evaluate, analyse, or predict aspects of a person's behaviour, preferences, reliability, economic situation, health, location, or movements?",
      why:
        "Profiling is an absolute blocker. If your system profiles people, it is ALWAYS high-risk under Annex III. No exception is possible.",
      helper:
        "Examples of profiling: building user profiles for ad targeting, scoring job candidates, predicting customer churn based on behaviour patterns, assessing creditworthiness.",
      legal: { article: "Art. 6(3) final subparagraph" },
    },
    {
      id: "significant_risk_of_harm",
      step: "step5",
      order: 1,
      type: "yes_no",
      prompt:
        "Could this system pose a significant risk of harm to the health, safety, or fundamental rights of people?",
      why:
        "The exception only applies if the system does NOT pose significant risk. If it can meaningfully affect someone's health, safety, or rights, the exception does not apply.",
      helper:
        "Think about worst-case scenarios. If the system makes a mistake or is misused, could someone lose a job, be denied benefits, face discrimination, or be physically harmed?",
      legal: { article: "Art. 6(3) first subparagraph" },
      showIf: (a) => a.profiles_natural_persons === "no",
    },
    {
      id: "material_influence_on_decision",
      step: "step5",
      order: 2,
      type: "yes_no",
      prompt:
        "Does this system materially influence the outcome of a decision about a person — meaning a human decision-maker relies on or routinely follows the AI's output?",
      why:
        "'Materially influencing' means the system's output meaningfully shapes the decision. If a human always makes the final decision but practically always agrees with the AI, the influence is material.",
      helper:
        "If the AI output is one of many minor inputs and the human frequently overrides it, it may not be material.",
      legal: { article: "Art. 6(3) first subparagraph" },
      showIf: (a) =>
        a.profiles_natural_persons === "no" && a.significant_risk_of_harm === "no",
    },
    {
      id: "exception_limb",
      step: "step5",
      order: 3,
      type: "single_select",
      prompt: "Which of the following best describes what your system does?",
      why:
        "At least one of these four Art. 6(3) limbs must apply for the exception to succeed.",
      legal: { article: "Art. 6(3)(a)-(d)" },
      showIf: (a) =>
        a.profiles_natural_persons === "no" &&
        a.significant_risk_of_harm === "no" &&
        a.material_influence_on_decision === "no",
      options: [
        {
          value: "narrow_procedural_task",
          label: "Narrow procedural task",
          subLabel: "Format conversion, deduplication, data structuring — no evaluative judgment",
        },
        {
          value: "improves_completed_human_activity",
          label: "Improves a completed human activity",
          subLabel: "Spell-check, reformatting — the human did the substantive work, the AI polishes it",
        },
        {
          value: "pattern_detection_no_replacement",
          label: "Detects patterns in prior human decisions",
          subLabel: "Flags inconsistencies for human self-correction without replacing the human assessment",
        },
        {
          value: "preparatory_task",
          label: "Prepares materials for a later human assessment",
          subLabel: "Gathering files, organising data — the AI does not assess the case",
        },
        { value: "none_of_the_above", label: "None of the above" },
      ],
    },
  ],
};
