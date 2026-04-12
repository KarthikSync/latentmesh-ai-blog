// Step 7 — GPAI model track (Arts. 3(63), 51, 53, 55)
// Beginner-facing copy: "GPAI" — 7 questions rewritten in the tighter voice.
// The model classification (model_result) is independent of who the user is;
// gpai_obligation_holder is set separately based on provider_placing_on_eu_market.
// Field ids and legal references unchanged.

import type { StepDef } from "../types";

export const STEP_7: StepDef = {
  id: "step7",
  title: "GPAI model details",
  shortLabel: "GPAI",
  intro:
    "Tell us about the general-purpose AI model you are assessing. These questions determine the model's classification and who holds the obligations.",
  questions: [
    {
      id: "is_gpai_model",
      step: "step7",
      order: 0,
      type: "yes_no",
      prompt: "Is the model a general-purpose AI model?",
      helper:
        "A GPAI model shows significant generality, can perform many different tasks, and can be integrated into a variety of downstream systems. Most large language, multimodal, or image generation models qualify. A model trained for one specific narrow task does not.",
      why:
        "If yes, the model enters the GPAI track regardless of whether you are the provider or a downstream user.",
      legal: { article: "Art. 3(63)" },
      showIf: undefined, // always shown when step7 is reachable (model_only or both)
    },
    {
      id: "provider_placing_on_eu_market",
      step: "step7",
      order: 1,
      type: "yes_no",
      prompt: "Are you the provider placing this model on the EU market?",
      helper:
        "This includes making the model available via API, download, or integration into other products. If you are using someone else's model, the upstream provider holds the GPAI obligations, not you.",
      why:
        "Model classification does not change based on the answer. Only the obligation holder does.",
      legal: { article: "Art. 53" },
      showIf: (a) => a.is_gpai_model === "yes",
    },
    {
      id: "gpai_open_source",
      step: "step7",
      order: 2,
      type: "yes_no",
      prompt:
        "Is this model released as open-source with publicly available weights, architecture, and usage documentation?",
      helper:
        "This is a stricter openness test than the Art. 2(12) system-level exclusion — it requires public weights, architecture, and usage documentation, not just a licence.",
      why:
        "If yes, reduced transparency obligations apply under Art. 53(2) — but only for models without systemic risk, and copyright obligations still apply.",
      legal: { article: "Art. 53(2)", recital: "Recital 102" },
      showIf: (a) => a.is_gpai_model === "yes",
    },
    {
      id: "training_compute_above_threshold",
      step: "step7",
      order: 3,
      type: "yes_no_unsure",
      prompt:
        "Was this model trained with more than 10²⁵ floating-point operations?",
      helper:
        "This is the current threshold for presumed systemic risk. Check the model card, training report, or your ML engineering team.",
      why: "If yes, the model is presumed to have systemic risk.",
      legal: { article: "Art. 51(2)" },
      showIf: (a) => a.is_gpai_model === "yes",
    },
    {
      id: "commission_designated_systemic",
      step: "step7",
      order: 4,
      type: "yes_no",
      prompt:
        "Has the European Commission designated this model as having systemic risk?",
      helper:
        "The Commission can designate a model as systemic-risk regardless of training compute, based on high-impact capabilities.",
      why: "If yes, the model is classified as GPAI with systemic risk.",
      legal: { article: "Art. 51(1)" },
      showIf: (a) => a.is_gpai_model === "yes",
    },
    {
      id: "commission_rebuttal_accepted",
      step: "step7",
      order: 5,
      type: "yes_no",
      prompt:
        "Has the provider successfully rebutted the systemic risk designation?",
      helper:
        "Providers can present arguments that their model does not in fact have systemic-risk capabilities. If the Commission accepts the rebuttal, the designation is withdrawn.",
      why: "If yes, the model is downgraded from systemic risk to standard GPAI.",
      legal: { article: "Art. 51(2)" },
      showIf: (a) =>
        a.is_gpai_model === "yes" &&
        (a.training_compute_above_threshold === "yes" ||
          a.commission_designated_systemic === "yes"),
    },
  ],
};
