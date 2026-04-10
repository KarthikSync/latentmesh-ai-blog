// Step 7 — GPAI model track (Arts. 3(63), 51, 53, 55)
// Runs as a parallel track independent of system_result.
// v1.1 correction: model_result is decided purely from model characteristics.
// provider_placing_on_eu_market only affects gpai_obligation_holder, not model_result.

import type { StepDef } from "../types";

export const STEP_7: StepDef = {
  id: "step7",
  title: "Are you also assessing a general-purpose AI model?",
  shortLabel: "GPAI",
  intro:
    "The Act treats AI systems (applications) and GPAI models (foundation models) as separate categories. A system can be high-risk AND built on a GPAI model with systemic risk.",
  questions: [
    {
      id: "assessment_target",
      step: "step7",
      order: 0,
      type: "single_select",
      prompt: "Are you assessing...",
      why:
        "You may need to assess both if you build a foundation model AND deploy it as an application.",
      legal: { article: "Art. 3(63)" },
      options: [
        { value: "system_only", label: "Only an AI system / application" },
        { value: "model_only", label: "Only a GPAI model (foundation / base model)" },
        { value: "both", label: "Both a system and a model" },
      ],
    },
    {
      id: "is_gpai_model",
      step: "step7",
      order: 1,
      type: "yes_no",
      prompt:
        "Is the model a general-purpose AI model — displaying significant generality, able to perform a wide range of distinct tasks, and integrable into a variety of downstream systems or applications?",
      why:
        "Most large language models, multimodal models, and large image generators qualify. A narrow model trained for one specific task does not.",
      legal: { article: "Art. 3(63)" },
      showIf: (a) =>
        a.assessment_target === "model_only" || a.assessment_target === "both",
    },
    {
      id: "provider_placing_on_eu_market",
      step: "step7",
      order: 2,
      type: "yes_no",
      prompt:
        "Are you the provider placing this GPAI model on the EU market (including via API, download, or integration into other products)?",
      why:
        "GPAI obligations under Articles 53-55 fall on the provider who places the model on the market. If you are using someone else's model, the model is still classified as GPAI — the obligations fall on the upstream provider, not you.",
      legal: { article: "Art. 53" },
      showIf: (a) => a.is_gpai_model === "yes",
    },
    {
      id: "gpai_open_source",
      step: "step7",
      order: 3,
      type: "yes_no",
      prompt:
        "Is this GPAI model released under a free and open-source licence with publicly available model weights, architecture, and usage information?",
      why:
        "Open-source GPAI models benefit from reduced obligations under Article 53(2). However, this exception does NOT apply to models with systemic risk, and copyright-related obligations still apply.",
      helper:
        "This is a stricter openness test than the Art. 2(12) system-level test — it requires public weights, architecture, AND usage documentation, not just an open-source licence.",
      legal: { article: "Art. 53(2)", recital: "Recital 102" },
      showIf: (a) => a.is_gpai_model === "yes",
    },
    {
      id: "training_compute_above_threshold",
      step: "step7",
      order: 4,
      type: "yes_no_unsure",
      prompt:
        "Was the model trained using a total compute of more than 10²⁵ floating-point operations (FLOPs)?",
      why:
        "This is the current threshold for presumed systemic risk.",
      helper:
        "If you don't know, check the model card, training report, or consult your ML engineering team.",
      legal: { article: "Art. 51(2)" },
      showIf: (a) => a.is_gpai_model === "yes",
    },
    {
      id: "commission_designated_systemic",
      step: "step7",
      order: 5,
      type: "yes_no",
      prompt:
        "Has the European Commission designated this model as having systemic risk (even if it's below the FLOPs threshold)?",
      why:
        "The Commission can designate models as systemic risk based on high-impact capabilities, regardless of training compute.",
      legal: { article: "Art. 51(1)" },
      showIf: (a) => a.is_gpai_model === "yes",
    },
    {
      id: "commission_rebuttal_accepted",
      step: "step7",
      order: 6,
      type: "yes_no",
      prompt:
        "Has the provider successfully rebutted the systemic risk presumption, and has the Commission accepted the rebuttal?",
      why:
        "Providers can present arguments that their model does not in fact have systemic-risk capabilities. If the Commission accepts, the designation is withdrawn.",
      legal: { article: "Art. 51(2)" },
      showIf: (a) =>
        a.is_gpai_model === "yes" &&
        (a.training_compute_above_threshold === "yes" ||
          a.commission_designated_systemic === "yes"),
    },
  ],
};
