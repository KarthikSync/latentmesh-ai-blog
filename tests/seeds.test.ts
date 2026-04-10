// Seed scenario tests. Each canonical scenario must produce its expected
// classification when run through the engine. This doubles as end-to-end
// coverage of the drift resolutions that the seeds demonstrate.

import { describe, expect, it } from "vitest";
import { classify } from "../src/lib/eu-ai-act-classifier/engine";
import { SEEDS, findSeed } from "../src/data/eu-ai-act-classifier/seeds";

describe("seed scenarios", () => {
  it("every seed declares the system_result it expects classify() to return", () => {
    expect(SEEDS.length).toBeGreaterThan(0);
    for (const seed of SEEDS) {
      const result = classify(seed.answers);
      expect(result.system_result).toBe(seed.expectedSystemResult);
    }
  });

  it("happy-high-risk-employment seed → high_risk_annex_iii with profiling blocker", () => {
    const seed = findSeed("happy-high-risk-employment")!;
    const r = classify(seed.answers);
    expect(r.system_result).toBe("high_risk_annex_iii");
    expect(r.article_6_3_exception.applies).toBe(false);
    expect(r.article_6_3_exception.reason).toContain("profiling");
  });

  it("art-6-3-exception-success seed → Art. 49(2) note, no notify wording", () => {
    const seed = findSeed("art-6-3-exception-success")!;
    const r = classify(seed.answers);
    expect(r.article_6_3_exception.applies).toBe(true);
    const notes = r.post_classification_notes.join(" ");
    expect(notes).toMatch(/49\(2\)/);
    expect(notes).toMatch(/document/i);
    expect(notes).not.toMatch(/\bnotify\b/i);
  });

  it("art-2-12-open-source seed → out_of_scope + excluded_under_art_2_12", () => {
    const seed = findSeed("art-2-12-open-source")!;
    const r = classify(seed.answers);
    expect(r.system_result).toBe("out_of_scope");
    expect(r.scope_status).toBe("excluded_under_art_2_12");
    expect(r.open_source.exclusion_applies).toBe(true);
  });

  it("gpai-upstream-provider seed → gpai + upstream_provider holder", () => {
    const seed = findSeed("gpai-upstream-provider")!;
    const r = classify(seed.answers);
    expect(r.model_result).toBe("gpai");
    expect(r.gpai_obligation_holder).toBe("upstream_provider");
    expect(
      r.post_classification_notes.some((n) => n.includes("upstream provider"))
    ).toBe(true);
  });

  it("personal-non-professional seed → deployer_obligation_exempt + NOT out_of_scope", () => {
    const seed = findSeed("personal-non-professional")!;
    const r = classify(seed.answers);
    expect(r.deployer_obligation_exempt).toBe(true);
    expect(r.system_result).not.toBe("out_of_scope");
    expect(r.scope_status).toBe("in_scope");
  });

  it("findSeed returns null for unknown ids", () => {
    expect(findSeed("no-such-seed")).toBe(null);
  });
});
