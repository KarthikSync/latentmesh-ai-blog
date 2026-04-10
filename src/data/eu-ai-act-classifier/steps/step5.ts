// Step 5 — Article 6(3) exception test
// Beginner-facing copy: "EXCEPTION" — 4 questions with a short question,
// plain-language helper, and one-line consequence in the "why" field. The
// engine logic is unchanged: profiling is an absolute blocker, all three
// threshold conditions must be No, and at least one of the four Art. 6(3)
// limbs must apply.

import type { StepDef } from "../types";

export const STEP_5: StepDef = {
  id: "step5",
  title:
    "This system matches an Annex III use case, but it may still fall outside high-risk",
  shortLabel: "Exception",
  intro:
    "In limited cases, a system that matches an Annex III use case is not treated as high-risk. This exception applies only if all required conditions are met.",
  questions: [
    {
      id: "profiles_natural_persons",
      step: "step5",
      order: 0,
      type: "yes_no",
      prompt: "Does the system profile natural persons?",
      helper:
        "Profiling means automatically using personal data to evaluate or predict aspects of a person, such as behaviour, preferences, reliability, economic situation, health, location, or movements.",
      why: "If yes, this exception is not available.",
      legal: { article: "Art. 6(3) final subparagraph" },
    },
    {
      id: "significant_risk_of_harm",
      step: "step5",
      order: 1,
      type: "yes_no",
      prompt:
        "Could this system pose a significant risk of harm to health, safety, or fundamental rights?",
      helper:
        "Think about worst-case scenarios. If a mistake or misuse could lead to someone losing a job, being denied benefits, facing discrimination, or being physically harmed, the answer is Yes.",
      why: "If yes, this exception is not available.",
      legal: { article: "Art. 6(3) first subparagraph" },
      showIf: (a) => a.profiles_natural_persons === "no",
    },
    {
      id: "material_influence_on_decision",
      step: "step5",
      order: 2,
      type: "yes_no",
      prompt:
        "Does the system materially influence a decision that affects a person?",
      helper:
        "A system materially influences a decision when a human decision-maker relies on its output, even if the human has the final say. If the output is only one of many minor inputs and humans frequently override it, the influence may not be material.",
      why: "If yes, this exception is not available.",
      legal: { article: "Art. 6(3) first subparagraph" },
      showIf: (a) =>
        a.profiles_natural_persons === "no" && a.significant_risk_of_harm === "no",
    },
    {
      id: "exception_limb",
      step: "step5",
      order: 3,
      type: "single_select",
      prompt: "Which of the following best describes what this system does?",
      helper:
        "This exception only applies if the system's role is narrow, auxiliary, or purely preparatory. Pick the option that best matches — or 'None of the above' if none fits.",
      why:
        "At least one of the four Art. 6(3) limbs must apply for the exception to succeed.",
      legal: { article: "Art. 6(3)(a)-(d)" },
      showIf: (a) =>
        a.profiles_natural_persons === "no" &&
        a.significant_risk_of_harm === "no" &&
        a.material_influence_on_decision === "no",
      options: [
        {
          value: "narrow_procedural_task",
          label: "Performs a narrow procedural task only",
          subLabel:
            "Format conversion, deduplication, structuring data — no evaluative judgment.",
        },
        {
          value: "improves_completed_human_activity",
          label: "Improves a completed human activity only",
          subLabel:
            "Spell-check, reformatting — a human has already done the substantive work.",
        },
        {
          value: "pattern_detection_no_replacement",
          label: "Flags patterns in prior human decisions only",
          subLabel:
            "Highlights inconsistencies for human review, without replacing the human's decision.",
        },
        {
          value: "preparatory_task",
          label: "Prepares materials for a later human assessment only",
          subLabel:
            "Gathers or organises files ahead of human review. Does not assess the case.",
        },
        { value: "none_of_the_above", label: "None of the above" },
      ],
    },
  ],
};
