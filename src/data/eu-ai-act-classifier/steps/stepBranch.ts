// Early branch screen — "What are you assessing?"
// Inserted after scope gate (Steps 0-1), before any system or model
// track screens. Sets assessment_target which routes the entire
// downstream flow. Reuses the existing assessment_target field so
// the engine needs zero changes.

import type { StepDef } from "../types";

export const STEP_BRANCH: StepDef = {
  id: "step_branch",
  title: "What are you assessing?",
  shortLabel: "Track",
  intro:
    "The EU AI Act treats AI systems and general-purpose AI models as separate categories. You may need to assess one, or both.",
  questions: [
    {
      id: "assessment_target",
      step: "step_branch",
      order: 0,
      type: "single_select",
      prompt: "What are you assessing?",
      helper:
        "Choose 'Only an AI system / application' if you are assessing a product or feature that uses AI. Choose 'Only a GPAI model' if you develop, place on the market, or substantially modify a general-purpose AI model.",
      why:
        "This determines which regulatory track applies. The system track covers Chapter III (high-risk) and Art. 50 (transparency). The model track covers Chapter V (GPAI). You may need both.",
      legal: { article: "Art. 3(1), Art. 3(63)" },
      options: [
        {
          value: "system_only",
          label: "Only an AI system / application",
          subLabel: "You are assessing a product or feature that uses AI.",
        },
        {
          value: "model_only",
          label: "Only a GPAI model",
          subLabel:
            "You develop, place on the market, or substantially modify a general-purpose AI model.",
        },
        {
          value: "both",
          label: "Both a system and a model",
          subLabel:
            "You need to assess both the application and the underlying model.",
        },
      ],
    },
  ],
};
