import { describe, expect, it } from "vitest";
import {
  filterModelObligations,
  filterSystemObligations,
} from "../src/lib/eu-ai-act-classifier/obligationFilter";
import { ALL_OBLIGATIONS } from "../src/data/eu-ai-act-classifier/obligations";
import type {
  ModelProfile,
  SystemProfile,
} from "../src/data/eu-ai-act-classifier/obligation-types";

// ── System-track filter tests ────────────────────────────────────

describe("filterSystemObligations", () => {
  const highRiskProvider: SystemProfile = {
    risk_level: "high_risk",
    annex_iii_categories: ["employment"],
    art_50_triggers: [],
    role: ["provider"],
    applicable_frameworks: ["eu_ai_act"],
    geography: ["EU"],
    is_sme: null,
  };

  it("returns provider obligations for a high-risk provider profile", () => {
    const filtered = filterSystemObligations(ALL_OBLIGATIONS, highRiskProvider);
    expect(filtered.length).toBeGreaterThan(0);
    // All returned obligations should be system-track and apply to provider
    for (const obl of filtered) {
      expect(obl.obligation_track).toBe("system");
      expect(obl.applies_to_roles).toEqual(
        expect.arrayContaining(["provider"])
      );
    }
  });

  it("includes Art. 14 human oversight for provider", () => {
    const filtered = filterSystemObligations(ALL_OBLIGATIONS, highRiskProvider);
    expect(filtered.some((o) => o.source_code.startsWith("Art. 14"))).toBe(true);
  });

  it("excludes deployer-only obligations for a provider profile", () => {
    const filtered = filterSystemObligations(ALL_OBLIGATIONS, highRiskProvider);
    const deployerOnly = filtered.filter(
      (o) =>
        o.applies_to_roles?.length === 1 &&
        o.applies_to_roles[0] === "deployer"
    );
    expect(deployerOnly.length).toBe(0);
  });

  it("returns deployer obligations for a deployer profile", () => {
    const deployerProfile: SystemProfile = {
      ...highRiskProvider,
      role: ["deployer"],
    };
    const filtered = filterSystemObligations(ALL_OBLIGATIONS, deployerProfile);
    expect(filtered.some((o) => o.source_code.startsWith("Art. 26"))).toBe(true);
  });

  it("returns union of provider + deployer obligations for Both", () => {
    const bothProfile: SystemProfile = {
      ...highRiskProvider,
      role: ["provider", "deployer"],
    };
    const filtered = filterSystemObligations(ALL_OBLIGATIONS, bothProfile);
    const providerOnly = filterSystemObligations(ALL_OBLIGATIONS, { ...highRiskProvider, role: ["provider"] });
    const deployerOnly = filterSystemObligations(ALL_OBLIGATIONS, { ...highRiskProvider, role: ["deployer"] });
    expect(filtered.length).toBeGreaterThanOrEqual(providerOnly.length);
    expect(filtered.length).toBeGreaterThanOrEqual(deployerOnly.length);
  });

  it("returns empty array for null risk level (out_of_scope)", () => {
    const profile: SystemProfile = { ...highRiskProvider, risk_level: null };
    expect(filterSystemObligations(ALL_OBLIGATIONS, profile)).toEqual([]);
  });

  it("includes Art. 50 obligations when Art. 50 triggers are present", () => {
    const transparencyProfile: SystemProfile = {
      risk_level: "limited_risk",
      annex_iii_categories: [],
      art_50_triggers: [
        { trigger: "interacts_directly_with_people", article: "Art. 50(1)", obligation: "test" },
      ],
      role: ["provider", "deployer"],
      applicable_frameworks: ["eu_ai_act"],
      geography: ["EU"],
      is_sme: null,
    };
    const filtered = filterSystemObligations(ALL_OBLIGATIONS, transparencyProfile);
    expect(filtered.some((o) => o.source_code.startsWith("Art. 50"))).toBe(true);
  });

  it("excludes model-track obligations", () => {
    const filtered = filterSystemObligations(ALL_OBLIGATIONS, highRiskProvider);
    for (const obl of filtered) {
      expect(obl.obligation_track).toBe("system");
    }
  });
});

// ── Model-track filter tests ─────────────────────────────────────

describe("filterModelObligations", () => {
  const gpaiSelf: ModelProfile = {
    model_result: "gpai",
    gpai_obligation_holder: "self",
    gpai_open_source_exception: false,
    applicable_frameworks: ["eu_ai_act"],
  };

  it("returns model obligations for gpai self provider", () => {
    const filtered = filterModelObligations(ALL_OBLIGATIONS, gpaiSelf);
    expect(filtered.length).toBeGreaterThan(0);
    for (const item of filtered) {
      expect(item.record.obligation_track).toBe("model");
    }
  });

  it("returns obligations for upstream_provider", () => {
    const upstream: ModelProfile = { ...gpaiSelf, gpai_obligation_holder: "upstream_provider" };
    const filtered = filterModelObligations(ALL_OBLIGATIONS, upstream);
    expect(filtered.length).toBeGreaterThan(0);
    for (const item of filtered) {
      expect(item.record.model_applicability?.holder_types).toContain("upstream_provider");
    }
  });

  it("superset rule: gpai_systemic_risk includes gpai-level obligations", () => {
    const systemic: ModelProfile = { ...gpaiSelf, model_result: "gpai_systemic_risk" };
    const filtered = filterModelObligations(ALL_OBLIGATIONS, systemic);
    // Should include obligations tagged for just 'gpai' too
    const gpaiOnly = filtered.filter((f) =>
      f.record.model_applicability?.model_risk_levels.includes("gpai")
    );
    expect(gpaiOnly.length).toBeGreaterThan(0);
  });

  it("returns empty for model_result = none", () => {
    const none: ModelProfile = { ...gpaiSelf, model_result: "none" };
    expect(filterModelObligations(ALL_OBLIGATIONS, none)).toEqual([]);
  });

  it("returns empty for not_applicable holder", () => {
    const na: ModelProfile = { ...gpaiSelf, gpai_obligation_holder: "not_applicable" };
    expect(filterModelObligations(ALL_OBLIGATIONS, na)).toEqual([]);
  });

  it("open-source exempt: omits Art. 53(1)(d) for open-source gpai", () => {
    const ossGpai: ModelProfile = { ...gpaiSelf, gpai_open_source_exception: true };
    const filtered = filterModelObligations(ALL_OBLIGATIONS, ossGpai);
    const exemptObligation = filtered.find(
      (f) => f.record.obligation_id === "mod-art53-1d"
    );
    expect(exemptObligation).toBeUndefined(); // omitted entirely
  });

  it("open-source reduced_scope: includes with note for Art. 53(1)(a)", () => {
    const ossGpai: ModelProfile = { ...gpaiSelf, gpai_open_source_exception: true };
    const filtered = filterModelObligations(ALL_OBLIGATIONS, ossGpai);
    const reducedObl = filtered.find((f) => f.record.obligation_id === "mod-art53-1a");
    expect(reducedObl).toBeDefined();
    expect(reducedObl!.showOpenSourceNote).toBe(true);
  });

  it("open-source has no effect on systemic-risk models", () => {
    const ossSystemic: ModelProfile = {
      ...gpaiSelf,
      model_result: "gpai_systemic_risk",
      gpai_open_source_exception: true,
    };
    const filtered = filterModelObligations(ALL_OBLIGATIONS, ossSystemic);
    // Art. 53(1)(d) should NOT be omitted for systemic risk
    const art53d = filtered.find((f) => f.record.obligation_id === "mod-art53-1d");
    expect(art53d).toBeDefined();
    expect(art53d!.showOpenSourceNote).toBe(false);
  });
});
