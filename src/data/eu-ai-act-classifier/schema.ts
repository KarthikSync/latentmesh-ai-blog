// EU AI Act Classifier — aggregated schema
// Single exported CLASSIFIER_SCHEMA is the source of truth consumed by engine and UI.
// Per-step data lives in ./steps/*.ts; this file assembles them.

import type { ClassifierSchema, SystemResult, ModelResult } from "./types";
import { SCHEMA_VERSION } from "./types";
import { STEP_0 } from "./steps/step0";
import { STEP_1 } from "./steps/step1";
import { STEP_BRANCH } from "./steps/stepBranch";
import { STEP_2 } from "./steps/step2";
import { STEP_3 } from "./steps/step3";
import { STEP_4 } from "./steps/step4";
import { STEP_5 } from "./steps/step5";
import { STEP_6 } from "./steps/step6";
import { STEP_7 } from "./steps/step7";
import { STEP_8, TIMING_MILESTONES } from "./steps/step8";

export { SCHEMA_VERSION };
export type { ClassifierSchema };

const DISPLAY_LABELS: Record<SystemResult | ModelResult, string> = {
  not_ai_system: "Not an AI system under the Act",
  out_of_scope: "Out of scope",
  prohibited: "Prohibited — this practice is banned",
  high_risk_annex_i: "High-risk — product safety (Annex I)",
  high_risk_annex_iii: "High-risk — use case (Annex III)",
  limited_risk_transparency: "Transparency obligations apply",
  minimal_risk: "Minimal or no specific obligations identified",
  none: "No GPAI model obligations",
  gpai: "GPAI model obligations apply",
  gpai_systemic_risk: "GPAI model with systemic risk",
};

const OBLIGATIONS_TEMPLATES: Record<SystemResult, string[]> = {
  not_ai_system: [
    "Your software does not meet the Article 3(1) definition of an AI system, so the EU AI Act does not apply.",
    "If you later add machine-learning or inference-based components, reassess.",
  ],
  out_of_scope: [
    "Based on your answers, the EU AI Act does not apply to this system.",
    "If circumstances change (e.g., you start serving EU users, or the system moves from research to production), reassess.",
  ],
  prohibited: [
    "This system appears to involve a practice prohibited under Article 5. Article 5 prohibitions have been enforceable since 2 February 2025.",
    "We strongly recommend consulting qualified legal counsel before proceeding.",
  ],
  high_risk_annex_i: [
    "As the provider of a high-risk system embedded in a regulated product, your key obligations include: risk management (Art. 9), data governance (Art. 10), technical documentation (Art. 11), record-keeping (Art. 12), transparency to deployers (Art. 13), human oversight design (Art. 14), and accuracy, robustness, and cybersecurity (Art. 15).",
    "You must undergo a third-party conformity assessment by a notified body before placing the system on the market.",
    "Compliance deadline: 2 August 2027 (extended timeline for Annex I systems).",
  ],
  high_risk_annex_iii: [
    "As the provider of a high-risk system, your key obligations include: risk management (Art. 9), data governance (Art. 10), technical documentation (Art. 11), record-keeping (Art. 12), transparency to deployers (Art. 13), human oversight design (Art. 14), and accuracy, robustness, and cybersecurity (Art. 15).",
    "You must register this system in the EU database before placing it on the market (Art. 49).",
    "Deployers have their own obligations under Articles 26-27, including human oversight and post-market monitoring cooperation.",
    "If your system processes personal data, GDPR applies alongside the AI Act. A Data Protection Impact Assessment (GDPR Art. 35) is likely required.",
  ],
  limited_risk_transparency: [
    "Your system triggers transparency obligations under Article 50.",
    "You must ensure users know they are interacting with AI, and that AI-generated content is disclosed or machine-detectable as appropriate.",
    "Compliance deadline: 2 August 2026.",
  ],
  minimal_risk: [
    "Based on your answers, no specific obligations under the EU AI Act have been identified for this system.",
    "You may still wish to voluntarily adopt codes of conduct (Art. 95) to demonstrate good practice.",
  ],
};

export const CLASSIFIER_SCHEMA: ClassifierSchema = {
  version: SCHEMA_VERSION,
  steps: [STEP_0, STEP_1, STEP_BRANCH, STEP_2, STEP_3, STEP_4, STEP_5, STEP_6, STEP_7, STEP_8],
  displayLabels: DISPLAY_LABELS,
  obligationsTemplates: OBLIGATIONS_TEMPLATES,
  timingMilestones: TIMING_MILESTONES,
};
