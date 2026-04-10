// Step 0 — AI system definition gate (Art. 3(1))
// Beginner-facing copy: "AI CHECK" — product-voice rewrite over the statutory
// test. Field ids and legal references are unchanged so the engine and tests
// remain stable.

import type { StepDef } from "../types";

export const STEP_0: StepDef = {
  id: "step0",
  title: "Is this an AI system under the EU AI Act?",
  shortLabel: "AI check",
  intro:
    "The Act applies only if your software meets the legal definition of an AI system. Let's start there.",
  questions: [
    {
      id: "is_ai_system",
      step: "step0",
      order: 0,
      type: "yes_no_unsure",
      prompt:
        "Does this software infer how to produce outputs from the data it receives?",
      helper:
        "Outputs can include predictions, recommendations, classifications, decisions, or generated content.",
      why:
        "Answer Yes if the system uses machine learning, natural language processing, computer vision, statistical inference, or knowledge-based reasoning. Answer No only if it follows fixed rules fully defined by a human, with no inference from data.",
      legal: {
        article: "Art. 3(1)",
        recital: "Recital 12",
        quote:
          "'AI system' means a machine-based system that is designed to operate with varying levels of autonomy and that may exhibit adaptiveness after deployment and that, for explicit or implicit objectives, infers, from the input it receives, how to generate outputs such as predictions, content, recommendations, or decisions that can influence physical or virtual environments.",
      },
      answerLabels: {
        yes: "Yes, this describes my system",
        no: "No, this does not describe my system",
        unsure: "I'm not sure",
      },
    },
  ],
};
