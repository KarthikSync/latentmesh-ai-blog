// Beginner-facing strings — result screen, landing page, disclaimers, terminology.
// Kept separate from schema.ts so the typed data tree stays scannable.

import type { SystemResult, ConfidenceTier } from "./types";

// ── Landing ─────────────────────────────────────────────────────

export const LANDING_COPY = {
  headline: "Is your AI system high-risk under the EU AI Act?",
  subhead:
    "Answer a few questions about your system. We'll tell you where it falls under Regulation 2024/1689 and what that means for you.",
  estimatedTime: "Takes 3–8 minutes depending on your system",
  trust:
    "This tool does not store your answers. It provides a preliminary assessment only and does not constitute legal advice.",
  cta: "Start assessment",
  regulationRef: "Regulation (EU) 2024/1689",
};

export const DISCLAIMER =
  "This tool provides a preliminary assessment only. It is not legal advice. For binding interpretation of your obligations under the EU AI Act, consult qualified legal counsel.";

// System-track summaries — explicitly scoped to the system track so they
// don't mislead when the model track carries real obligations.
export const RESULT_SUMMARIES: Record<SystemResult, string> = {
  not_ai_system:
    "Your software does not meet the Article 3(1) definition of an AI system. The EU AI Act does not apply.",
  out_of_scope:
    "Based on your answers, the EU AI Act does not apply to this system. Reassess if your circumstances change.",
  prohibited:
    "This system appears to involve a practice prohibited under Article 5. These prohibitions have been enforceable since 2 February 2025. We strongly recommend consulting qualified legal counsel before proceeding.",
  high_risk_annex_i:
    "This system is high-risk because it is part of a regulated product that requires third-party conformity assessment under Annex I. The full Chapter III obligations apply.",
  high_risk_annex_iii:
    "This system is high-risk because its intended use falls within Annex III of the EU AI Act. The full Chapter III obligations apply.",
  limited_risk_transparency:
    "This system triggers transparency obligations under Article 50. You must inform users they are interacting with AI and/or mark AI-generated content appropriately.",
  minimal_risk:
    "No specific system obligations identified by this tool.",
};

// Model-track summaries — shown alongside the system summary when
// model_result is not 'none'.
export const MODEL_RESULT_SUMMARIES: Record<string, string> = {
  none: "",
  gpai:
    "GPAI provider obligations apply. Some are enforceable now (since 2 August 2025).",
  gpai_systemic_risk:
    "GPAI systemic-risk obligations apply. These include enhanced transparency, adversarial testing, and incident reporting duties. Some are enforceable now.",
};

export const CONFIDENCE_COPY: Record<ConfidenceTier, { label: string; explanation: string }> = {
  clear_match: {
    label: "Clear match",
    explanation:
      "Your answers were definitive and map cleanly to a single classification. No further clarification needed for this preliminary assessment.",
  },
  likely_match: {
    label: "Likely match",
    explanation:
      "Your answers point to this classification, but one or more responses involved inherent ambiguity (e.g., 'materially influence' in the Art. 6(3) exception, or an 'unsure' answer). Review the flagged questions with your team.",
  },
  ambiguous_consult_legal: {
    label: "Ambiguous — consult legal counsel",
    explanation:
      "Several answers involve significant uncertainty. This classification should be treated as indicative only. We recommend a formal legal review before acting on it.",
  },
};

export const DEPLOYER_EXEMPT_NOTICE =
  "Because you are using this system for personal, non-professional purposes, Article 2(10) exempts you from deployer obligations. However, provider obligations still apply to whoever built the system, and the system itself remains in scope of the Act.";

export const OPEN_SOURCE_EXCLUSION_NOTICE =
  "Because this system is released under a free and open-source licence, falls into minimal-risk territory, and does not trigger any Article 50 transparency obligations, it is excluded from the Act's scope under Article 2(12). Note: this exclusion does NOT apply if your system becomes high-risk, prohibited, or triggers transparency duties in the future.";

export const ART_6_3_EXCEPTION_SUCCESS_NOTE =
  "Based on your answers, this system may qualify for the Article 6(3) exception. Under Article 6(4), you must document this assessment before placing the system on the market. You must also register the system in the EU database under Article 49(2), and make the documentation available to national competent authorities upon request. There is no proactive notification duty to authorities.";

export const GPAI_UPSTREAM_PROVIDER_NOTE =
  "The underlying model is classified as a GPAI model. Because you are not the provider placing this model on the EU market, the GPAI obligations under Articles 53-55 fall on the upstream provider (for example, the model vendor you access via API), not on you. You should still understand the regulatory context of the model you depend on.";

export const TERMINOLOGY = {
  provider: {
    legal: "Provider",
    beginner: "The company that built the AI system",
  },
  deployer: {
    legal: "Deployer",
    beginner: "The company that uses or deploys the AI system",
  },
  placing_on_market: {
    legal: "Placing on the market",
    beginner: "Making available for use in the EU",
  },
  putting_into_service: {
    legal: "Putting into service",
    beginner: "Deploying for real users",
  },
  notified_body: {
    legal: "Notified body",
    beginner: "Third-party assessor authorised under EU product-safety law",
  },
  conformity_assessment: {
    legal: "Conformity assessment",
    beginner: "Compliance assessment / certification process",
  },
  profiling: {
    legal: "Profiling",
    beginner:
      "Automatically processing personal data to evaluate or predict things about people",
  },
  intended_purpose: {
    legal: "Intended purpose",
    beginner: "What the system is designed and marketed to do",
  },
};
