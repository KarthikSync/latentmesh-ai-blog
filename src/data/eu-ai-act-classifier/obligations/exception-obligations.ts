// Exception-duty obligation records — duties that persist even after the
// Art. 6(3) exception removes a system from high-risk classification.
// Shown in a visually separate section titled "Duties that still apply
// after the Art. 6(3) exception".

import type { ObligationRecord } from "../obligation-types";

export const EXCEPTION_OBLIGATIONS: ObligationRecord[] = [
  {
    obligation_id: "exc-art6-4",
    obligation_track: "system",
    source_code: "Art. 6(4)",
    plain_language_requirement:
      "Document your Art. 6(3) assessment before placing the system on the market or putting it into service. The documentation must explain why each exception condition is met and be made available to national competent authorities on request. There is no proactive notification duty.",
    legal_source: { article: "6", paragraph: "4" },
    source_framework: "eu_ai_act",
    category: "technical_documentation",
    effective_from: "2026-08-02",
    coverage_batch: "batch-1",
    record_version: "1.0",
    last_reviewed_at: "2026-04-12",
    review_status: "approved",
    priority_label: "high",
    priority_reason: "Must be completed before market placement. Failure to document the exception assessment may invalidate the exception.",
    sanction_band: { max_fine_eur: 15_000_000, max_fine_turnover_pct: 3, band_label: "EUR 15M / 3%" },
    applies_to_roles: ["provider"],
    delivery_scope: "system",
    applicability_conditions: { risk_levels: ["high_risk"] },
  },
  {
    obligation_id: "exc-art49-2",
    obligation_track: "system",
    source_code: "Art. 49(2)",
    plain_language_requirement:
      "Register the system in the EU database before placing it on the market. Even though the system is not classified as high-risk due to the Art. 6(3) exception, registration under Art. 49(2) is still required.",
    legal_source: { article: "49", paragraph: "2" },
    source_framework: "eu_ai_act",
    category: "registration",
    effective_from: "2026-08-02",
    coverage_batch: "batch-1",
    record_version: "1.0",
    last_reviewed_at: "2026-04-12",
    review_status: "approved",
    priority_label: "high",
    priority_reason: "Must be completed before market placement. Required even after Art. 6(3) exception succeeds.",
    sanction_band: { max_fine_eur: 15_000_000, max_fine_turnover_pct: 3, band_label: "EUR 15M / 3%" },
    applies_to_roles: ["provider"],
    delivery_scope: "system",
    applicability_conditions: { risk_levels: ["high_risk"] },
  },
];
