// Navigation tests — step state machine and back-navigation cascade.

import { describe, expect, it } from "vitest";
import {
  allFieldIds,
  clearFieldsAfter,
  fieldsAfter,
  nextStep,
  previousStep,
  reachableSteps,
} from "../src/lib/eu-ai-act-classifier/navigation";
import type { AnswerSet } from "../src/data/eu-ai-act-classifier/types";

describe("reachableSteps", () => {
  it("is_ai_system=no cuts everything after step0", () => {
    const answers: AnswerSet = { is_ai_system: "no" };
    expect(reachableSteps(answers)).toEqual(["step0"]);
  });

  it("eu_nexus=no cuts everything after step1", () => {
    const answers: AnswerSet = { is_ai_system: "yes", eu_nexus: "no" };
    const reachable = reachableSteps(answers);
    expect(reachable).toContain("step0");
    expect(reachable).toContain("step1");
    expect(reachable).not.toContain("step2");
    expect(reachable).not.toContain("step5");
  });

  it("hides step5 when no Annex III domains selected", () => {
    const answers: AnswerSet = {
      is_ai_system: "yes",
      eu_nexus: "yes",
      military_defence_exclusion: "no",
      third_country_public_authority: "no",
      scientific_rnd_only: "no",
      premarket_testing_only: "no",
    };
    const reachable = reachableSteps(answers);
    expect(reachable).not.toContain("step5");
  });

  it("shows step5 when an Annex III sub-use-case is selected", () => {
    const answers: AnswerSet = {
      is_ai_system: "yes",
      eu_nexus: "yes",
      military_defence_exclusion: "no",
      emp_recruitment: "yes",
    };
    expect(reachableSteps(answers)).toContain("step5");
  });
});

describe("nextStep", () => {
  it("returns result when is_ai_system=no after step0", () => {
    const answers: AnswerSet = { is_ai_system: "no" };
    expect(nextStep("step0", answers)).toBe("result");
  });

  it("advances step3 → step4_tier1 by default", () => {
    const answers: AnswerSet = {
      is_ai_system: "yes",
      eu_nexus: "yes",
      military_defence_exclusion: "no",
      is_safety_component_or_product: "no",
    };
    expect(nextStep("step3", answers)).toBe("step4_tier1");
  });
});

describe("previousStep", () => {
  it("returns null at step0", () => {
    expect(previousStep("step0", { is_ai_system: "yes" })).toBe(null);
  });
});

describe("fieldsAfter + clearFieldsAfter", () => {
  it("fieldsAfter('step2') includes step3-8 fields and excludes step0-2 fields", () => {
    const after = fieldsAfter("step2");
    expect(after).toContain("is_safety_component_or_product");
    expect(after).toContain("emp_recruitment");
    expect(after).toContain("profiles_natural_persons");
    expect(after).toContain("interacts_directly_with_people");
    expect(after).not.toContain("is_ai_system");
    expect(after).not.toContain("eu_nexus");
    expect(after).not.toContain("prohibited_manipulation");
  });

  it("clearFieldsAfter preserves earlier answers and drops later ones", () => {
    const answers: AnswerSet = {
      is_ai_system: "yes",
      eu_nexus: "yes",
      prohibited_manipulation: "no",
      emp_recruitment: "yes",
      profiles_natural_persons: "yes",
      interacts_directly_with_people: "yes",
    };
    const cleared = clearFieldsAfter(answers, "step2");
    expect(cleared.is_ai_system).toBe("yes");
    expect(cleared.eu_nexus).toBe("yes");
    expect(cleared.prohibited_manipulation).toBe("no");
    expect(cleared.emp_recruitment).toBeUndefined();
    expect(cleared.profiles_natural_persons).toBeUndefined();
    expect(cleared.interacts_directly_with_people).toBeUndefined();
  });

  it("allFieldIds is non-empty and includes representative fields from every step", () => {
    const ids = allFieldIds();
    expect(ids.length).toBeGreaterThan(40);
    expect(ids).toContain("is_ai_system"); // step0
    expect(ids).toContain("eu_nexus"); // step1
    expect(ids).toContain("prohibited_manipulation"); // step2
    expect(ids).toContain("is_safety_component_or_product"); // step3
    expect(ids).toContain("emp_recruitment"); // step4
    expect(ids).toContain("profiles_natural_persons"); // step5
    expect(ids).toContain("interacts_directly_with_people"); // step6
    expect(ids).toContain("is_gpai_model"); // step7
    expect(ids).toContain("placed_on_market_before_2026_08_02"); // step8
  });
});
