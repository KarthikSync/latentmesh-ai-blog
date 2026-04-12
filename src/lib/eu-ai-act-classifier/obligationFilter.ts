// Two-track obligation filter. Pure functions, no DOM.
// Based on wizard-to-obligations-bridge-v1.7.md Section 5.3.

import { mapTriggerToConditionId } from "./bridge";
import type {
  ModelProfile,
  ObligationRecord,
  SystemProfile,
} from "../../data/eu-ai-act-classifier/obligation-types";

// ── System-track filter ──────────────────────────────────────────

export function filterSystemObligations(
  records: ObligationRecord[],
  profile: SystemProfile
): ObligationRecord[] {
  if (!profile.risk_level) return [];

  return records.filter((r) => {
    // Track discriminator
    if (r.obligation_track !== "system") return false;

    // Framework check
    if (!profile.applicable_frameworks.includes(r.source_framework)) return false;

    // Review status (only show approved records)
    if (r.review_status !== "approved") return false;

    // Role check — obligation applies to at least one of the user's roles
    if (r.applies_to_roles && r.applies_to_roles.length > 0) {
      const overlap = r.applies_to_roles.some((role) => profile.role.includes(role));
      if (!overlap) return false;
    }

    // Risk level check
    if (r.applicability_conditions?.risk_levels) {
      if (!r.applicability_conditions.risk_levels.includes(profile.risk_level!)) return false;
    }

    // Annex III category check (if the obligation is domain-specific)
    if (
      r.applicability_conditions?.annex_iii_categories &&
      r.applicability_conditions.annex_iii_categories.length > 0
    ) {
      const categoryOverlap = r.applicability_conditions.annex_iii_categories.some((cat) =>
        profile.annex_iii_categories.includes(cat)
      );
      if (!categoryOverlap) return false;
    }

    // System conditions check (Art. 50 triggers)
    if (
      r.applicability_conditions?.system_conditions &&
      r.applicability_conditions.system_conditions.length > 0
    ) {
      const triggerConditionIds = profile.art_50_triggers.map((t) =>
        mapTriggerToConditionId(t.trigger)
      );
      const conditionMet = r.applicability_conditions.system_conditions.some((sc) =>
        triggerConditionIds.includes(sc.condition_id)
      );
      if (!conditionMet) return false;
    }

    // Delivery scope check
    if (r.delivery_scope) {
      if (r.delivery_scope !== "system" && r.delivery_scope !== "both") return false;
    }

    return true;
  });
}

// ── Model-track filter ───────────────────────────────────────────

export interface FilteredModelObligation {
  record: ObligationRecord;
  showOpenSourceNote: boolean;
}

export function filterModelObligations(
  records: ObligationRecord[],
  profile: ModelProfile
): FilteredModelObligation[] {
  if (profile.model_result === "none") return [];
  if (profile.gpai_obligation_holder === "not_applicable") return [];

  const filtered: FilteredModelObligation[] = [];

  for (const r of records) {
    // Track discriminator
    if (r.obligation_track !== "model") continue;

    // Framework check
    if (!profile.applicable_frameworks.includes(r.source_framework)) continue;

    // Review status
    if (r.review_status !== "approved") continue;

    if (!r.model_applicability) continue;

    // Model risk level matching — SUPERSET RULE:
    // gpai_systemic_risk includes all gpai obligations plus systemic-specific ones.
    const riskLevels = r.model_applicability.model_risk_levels;
    if (profile.model_result === "gpai") {
      if (!riskLevels.includes("gpai")) continue;
    } else if (profile.model_result === "gpai_systemic_risk") {
      if (!riskLevels.includes("gpai") && !riskLevels.includes("gpai_systemic_risk")) continue;
    }

    // Holder type matching
    if (!r.model_applicability.holder_types.includes(profile.gpai_obligation_holder as "self" | "upstream_provider")) {
      continue;
    }

    // Open-source post-filter (only for non-systemic-risk gpai models)
    let showOpenSourceNote = false;
    if (
      profile.gpai_open_source_exception &&
      profile.model_result === "gpai"
    ) {
      const treatment = r.model_applicability.open_source_treatment;
      if (treatment === "exempt") continue; // omit entirely
      if (treatment === "reduced_scope") showOpenSourceNote = true;
    }

    filtered.push({ record: r, showOpenSourceNote });
  }

  return filtered;
}
