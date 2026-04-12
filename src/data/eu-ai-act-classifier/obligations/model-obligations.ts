// Model-track obligation records — Art. 53 (GPAI provider obligations).
// Arts. 54 (systemic risk) and 55 (codes of practice) are deferred until
// the coverage banner can honestly claim that scope.

import type { ObligationRecord } from "../obligation-types";

export const MODEL_OBLIGATIONS: ObligationRecord[] = [
  {
    obligation_id: "mod-art53-1a",
    obligation_track: "model",
    source_code: "Art. 53(1)(a)",
    plain_language_requirement:
      "Draw up and keep up to date technical documentation of the model, including its training and testing process and the results of its evaluation, and make it available to the AI Office and national competent authorities on request.",
    legal_source: { article: "53", paragraph: "1(a)" },
    source_framework: "eu_ai_act",
    category: "gpai_provider_obligations",
    effective_from: "2025-08-02",
    coverage_batch: "batch-1",
    record_version: "1.0",
    last_reviewed_at: "2026-04-12",
    review_status: "approved",
    priority_label: "high",
    priority_reason: "Enforceable now (from 2 August 2025). Core GPAI transparency obligation. EUR 15M / 3% sanction band.",
    sanction_band: { max_fine_eur: 15_000_000, max_fine_turnover_pct: 3, band_label: "EUR 15M / 3%" },
    model_applicability: {
      model_risk_levels: ["gpai", "gpai_systemic_risk"],
      holder_types: ["self", "upstream_provider"],
      open_source_treatment: "reduced_scope",
      open_source_note:
        "Open-source GPAI models benefit from reduced technical documentation requirements under Art. 53(2). A summary of the training content is still required.",
    },
  },
  {
    obligation_id: "mod-art53-1b",
    obligation_track: "model",
    source_code: "Art. 53(1)(b)",
    plain_language_requirement:
      "Draw up, keep up to date, and make available information and documentation to downstream providers of AI systems who intend to integrate the GPAI model into their systems. The documentation must enable them to understand the model's capabilities and limitations and to comply with their own obligations.",
    legal_source: { article: "53", paragraph: "1(b)" },
    source_framework: "eu_ai_act",
    category: "gpai_provider_obligations",
    effective_from: "2025-08-02",
    coverage_batch: "batch-1",
    record_version: "1.0",
    last_reviewed_at: "2026-04-12",
    review_status: "approved",
    priority_label: "high",
    priority_reason: "Enforceable now. Downstream providers rely on this documentation to meet their Chapter III obligations. EUR 15M / 3% sanction band.",
    sanction_band: { max_fine_eur: 15_000_000, max_fine_turnover_pct: 3, band_label: "EUR 15M / 3%" },
    model_applicability: {
      model_risk_levels: ["gpai", "gpai_systemic_risk"],
      holder_types: ["self", "upstream_provider"],
      open_source_treatment: "reduced_scope",
      open_source_note:
        "Open-source GPAI models benefit from reduced downstream-information requirements under Art. 53(2). Basic usage documentation is still required.",
    },
  },
  {
    obligation_id: "mod-art53-1c",
    obligation_track: "model",
    source_code: "Art. 53(1)(c)",
    plain_language_requirement:
      "Put in place a policy to comply with Union copyright law, in particular to identify and comply with copyright reservations expressed by rights holders pursuant to Article 4(3) of Directive (EU) 2019/790.",
    legal_source: { article: "53", paragraph: "1(c)" },
    source_framework: "eu_ai_act",
    category: "gpai_provider_obligations",
    effective_from: "2025-08-02",
    coverage_batch: "batch-1",
    record_version: "1.0",
    last_reviewed_at: "2026-04-12",
    review_status: "approved",
    priority_label: "high",
    priority_reason: "Enforceable now. Copyright compliance is mandatory for all GPAI models, including open-source. EUR 15M / 3% sanction band.",
    sanction_band: { max_fine_eur: 15_000_000, max_fine_turnover_pct: 3, band_label: "EUR 15M / 3%" },
    model_applicability: {
      model_risk_levels: ["gpai", "gpai_systemic_risk"],
      holder_types: ["self"],
      open_source_treatment: "none",
    },
  },
  {
    obligation_id: "mod-art53-1d",
    obligation_track: "model",
    source_code: "Art. 53(1)(d)",
    plain_language_requirement:
      "Draw up and make publicly available a sufficiently detailed summary of the content used for training the GPAI model, according to a template provided by the AI Office.",
    legal_source: { article: "53", paragraph: "1(d)" },
    source_framework: "eu_ai_act",
    category: "gpai_provider_obligations",
    effective_from: "2025-08-02",
    coverage_batch: "batch-1",
    record_version: "1.0",
    last_reviewed_at: "2026-04-12",
    review_status: "approved",
    priority_label: "high",
    priority_reason: "Enforceable now. The training content summary must follow the AI Office template. EUR 15M / 3% sanction band.",
    sanction_band: { max_fine_eur: 15_000_000, max_fine_turnover_pct: 3, band_label: "EUR 15M / 3%" },
    model_applicability: {
      model_risk_levels: ["gpai", "gpai_systemic_risk"],
      holder_types: ["self"],
      open_source_treatment: "exempt",
    },
  },
];
