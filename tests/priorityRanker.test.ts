import { describe, expect, it } from "vitest";
import { rankByPriority, renderObligations } from "../src/lib/eu-ai-act-classifier/priorityRanker";
import type {
  DisplayContext,
  ObligationRecord,
} from "../src/data/eu-ai-act-classifier/obligation-types";
import { SYSTEM_OBLIGATIONS } from "../src/data/eu-ai-act-classifier/obligations";

const defaultDisplayContext: DisplayContext = {
  timing: {
    compliance_deadline: "2026-08-02",
    rules_enforceable_now: false,
    legacy_system: false,
    significant_change_detected: false,
    public_authority_deadline: null,
    gpai_legacy_deadline: null,
    annex_i_extended_deadline: null,
  },
  confidence: "clear_match",
  system_result: "high_risk_annex_iii",
};

describe("rankByPriority", () => {
  it("returns at most maxItems obligations", () => {
    const ranked = rankByPriority(SYSTEM_OBLIGATIONS, defaultDisplayContext, 5);
    expect(ranked.length).toBeLessThanOrEqual(5);
  });

  it("enforceable-now obligations sort before future obligations", () => {
    // Create two mock obligations: one enforceable now, one future
    const now: ObligationRecord = {
      obligation_id: "early",
      obligation_track: "system",
      source_code: "Art. 5(1)",
      plain_language_requirement: "early",
      legal_source: { article: "5" },
      source_framework: "eu_ai_act",
      category: "risk_management",
      effective_from: "2025-02-02",
      coverage_batch: "batch-1",
      record_version: "1.0",
      last_reviewed_at: "2026-04-12",
      review_status: "approved",
      priority_label: "high",
      priority_reason: "enforceable now",
      sanction_band: { max_fine_eur: 35_000_000, max_fine_turnover_pct: 7, band_label: "EUR 35M / 7%" },
      applies_to_roles: ["provider"],
      delivery_scope: "system",
      applicability_conditions: { risk_levels: ["high_risk"] },
    };
    const future: ObligationRecord = {
      ...now,
      obligation_id: "future",
      effective_from: "2030-01-01",
      sanction_band: { max_fine_eur: 35_000_000, max_fine_turnover_pct: 7, band_label: "EUR 35M / 7%" },
    };

    const ranked = rankByPriority([future, now], defaultDisplayContext);
    expect(ranked[0].obligation_id).toBe("early");
    expect(ranked[0].enforceable_now).toBe(true);
  });

  it("uses sanction band as tiebreaker when dates match", () => {
    const highSanction: ObligationRecord = {
      obligation_id: "high-sanction",
      obligation_track: "system",
      source_code: "Art. X",
      plain_language_requirement: "test",
      legal_source: { article: "X" },
      source_framework: "eu_ai_act",
      category: "risk_management",
      effective_from: "2026-08-02",
      coverage_batch: "batch-1",
      record_version: "1.0",
      last_reviewed_at: "2026-04-12",
      review_status: "approved",
      priority_label: "high",
      priority_reason: "test",
      sanction_band: { max_fine_eur: 15_000_000, max_fine_turnover_pct: 3, band_label: "EUR 15M / 3%" },
      applies_to_roles: ["provider"],
      delivery_scope: "system",
      applicability_conditions: { risk_levels: ["high_risk"] },
    };
    const lowSanction: ObligationRecord = {
      ...highSanction,
      obligation_id: "low-sanction",
      sanction_band: { max_fine_eur: 7_500_000, max_fine_turnover_pct: 1, band_label: "EUR 7.5M / 1%" },
    };

    const ranked = rankByPriority([lowSanction, highSanction], defaultDisplayContext);
    expect(ranked[0].obligation_id).toBe("high-sanction");
  });
});

describe("renderObligations", () => {
  it("computes display_effective_from and enforceable_now for each obligation", () => {
    const rendered = renderObligations(SYSTEM_OBLIGATIONS.slice(0, 3), defaultDisplayContext);
    expect(rendered.length).toBe(3);
    for (const r of rendered) {
      expect(typeof r.display_effective_from).toBe("string");
      expect(typeof r.enforceable_now).toBe("boolean");
      expect(typeof r.why_applies).toBe("string");
    }
  });

  it("uses annex_i_extended_deadline for Annex I results", () => {
    const ctx: DisplayContext = {
      ...defaultDisplayContext,
      system_result: "high_risk_annex_i",
      timing: { ...defaultDisplayContext.timing, annex_i_extended_deadline: "2027-08-02" },
    };
    const rendered = renderObligations(SYSTEM_OBLIGATIONS.slice(0, 1), ctx);
    expect(rendered[0].display_effective_from).toBe("2027-08-02");
  });
});
