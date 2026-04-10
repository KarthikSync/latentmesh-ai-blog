// Step 0 — AI system definition gate (Art. 3(1))
// Uses schema v1.4 "infers from inputs" wording, not the pre-v1.1 "learns from data".

import type { StepDef } from "../types";

export const STEP_0: StepDef = {
  id: "step0",
  title: "Is this an AI system under the EU AI Act?",
  shortLabel: "AI check",
  intro:
    "The EU AI Act only applies to systems that meet the statutory definition of an AI system. Let's check.",
  questions: [
    {
      id: "is_ai_system",
      step: "step0",
      order: 0,
      type: "yes_no_unsure",
      prompt:
        "Does this software infer from the inputs it receives how to generate outputs — such as predictions, content, recommendations, or decisions — for explicit or implicit objectives?",
      why:
        "The EU AI Act defines an 'AI system' as a machine-based system that infers how to produce outputs. This is broader than 'machine learning' — it includes logic-based reasoning, knowledge graphs, expert systems, and statistical methods, not only neural networks. The key test is whether the system infers how to generate outputs, as opposed to software that executes only rules defined entirely and explicitly by a human programmer.",
      helper:
        "The answer is Yes if your system uses any of: machine learning or deep learning, natural language processing, computer vision, expert systems or knowledge-based reasoning, statistical inference, or any combination of these. The answer is No only if the software executes rules that were entirely and explicitly written by human programmers, with no inference or learned component at all. If you're unsure, proceed with Yes — it's safer to assess and find you're out of scope than to skip the assessment.",
      legal: {
        article: "Art. 3(1)",
        recital: "Recital 12",
        quote:
          "'AI system' means a machine-based system that is designed to operate with varying levels of autonomy and that may exhibit adaptiveness after deployment and that, for explicit or implicit objectives, infers, from the input it receives, how to generate outputs such as predictions, content, recommendations, or decisions that can influence physical or virtual environments.",
      },
    },
  ],
};
