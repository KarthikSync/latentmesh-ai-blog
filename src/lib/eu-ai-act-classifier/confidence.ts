// Confidence tier computation — pure function with no DOM dependencies.
// Ambiguity sources:
//  - "unsure" answers (each adds to unsureFields)
//  - Art. 6(3) exception succeeded (inherent subjectivity in "materially influence")
//  - Annex I third-party assessment is "unsure"
//  - Open-source + Art. 50 single-trigger near-miss (Art. 2(12) edge case)

import type { AnswerSet, ConfidenceTier, Result } from "../../data/eu-ai-act-classifier/types";

export function computeConfidence(answers: AnswerSet, result: Result): ConfidenceTier {
  const unsureCount = result.unsure_fields.length;

  const annexIThirdPartyUnsure = answers.requires_third_party_conformity === "unsure";

  const exceptionBorderline =
    result.article_6_3_exception.checked && result.article_6_3_exception.applies === true;

  const openSourceNearMiss =
    result.open_source.flagged &&
    (result.system_result === "limited_risk_transparency" ||
      result.system_result === "minimal_risk") &&
    result.article_50_transparency_triggers.length === 1;

  // ambiguous: multiple unsures, OR Annex I assessment unsure, OR open-source near-miss
  if (unsureCount >= 2 || annexIThirdPartyUnsure || openSourceNearMiss) {
    return "ambiguous_consult_legal";
  }

  // likely: single unsure OR Art. 6(3) exception succeeded
  if (unsureCount === 1 || exceptionBorderline) {
    return "likely_match";
  }

  return "clear_match";
}
