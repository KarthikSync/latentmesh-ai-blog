// Priority ranker — sorts obligations for Block 2 ("Start here").
// Ranks by: (1) enforceable-now promoted to top, (2) display_effective_from
// proximity (nearest deadline first), (3) sanction_band.max_fine_turnover_pct
// (higher penalty first as tiebreaker).

import { computeDisplayEffectiveFrom } from "./bridge";
import type {
  DisplayContext,
  ObligationRecord,
  RenderedObligation,
} from "../../data/eu-ai-act-classifier/obligation-types";

export function rankByPriority(
  obligations: ObligationRecord[],
  displayContext: DisplayContext,
  maxItems = 8
): RenderedObligation[] {
  const today = new Date().toISOString().slice(0, 10);

  const rendered: RenderedObligation[] = obligations.map((obl) => {
    const displayDate = computeDisplayEffectiveFrom(
      obl,
      displayContext.timing,
      displayContext.system_result
    );
    const enforceable = displayDate <= today;

    const why = generateWhyApplies(obl, displayContext);

    return {
      ...obl,
      display_effective_from: displayDate,
      enforceable_now: enforceable,
      why_applies: why,
    };
  });

  // Sort: enforceable-now first, then by date proximity, then by sanction band
  rendered.sort((a, b) => {
    // Enforceable now always sorts to top
    if (a.enforceable_now !== b.enforceable_now) {
      return a.enforceable_now ? -1 : 1;
    }
    // Nearest deadline first
    if (a.display_effective_from !== b.display_effective_from) {
      return a.display_effective_from < b.display_effective_from ? -1 : 1;
    }
    // Higher sanction band first
    return b.sanction_band.max_fine_turnover_pct - a.sanction_band.max_fine_turnover_pct;
  });

  return rendered.slice(0, maxItems);
}

// Also export a version that renders ALL obligations (for Block 3/4 and PDF)
export function renderObligations(
  obligations: ObligationRecord[],
  displayContext: DisplayContext
): RenderedObligation[] {
  const today = new Date().toISOString().slice(0, 10);

  return obligations.map((obl) => {
    const displayDate = computeDisplayEffectiveFrom(
      obl,
      displayContext.timing,
      displayContext.system_result
    );
    return {
      ...obl,
      display_effective_from: displayDate,
      enforceable_now: displayDate <= today,
      why_applies: generateWhyApplies(obl, displayContext),
    };
  });
}

function generateWhyApplies(obl: ObligationRecord, ctx: DisplayContext): string {
  if (obl.obligation_track === "model") {
    return `This obligation applies because the underlying model is classified as a GPAI model under the EU AI Act.`;
  }

  const parts: string[] = [];

  if (ctx.system_result === "high_risk_annex_i") {
    parts.push("your system is high-risk under Annex I (product safety)");
  } else if (ctx.system_result === "high_risk_annex_iii") {
    parts.push("your system is high-risk under Annex III");
  } else if (ctx.system_result === "limited_risk_transparency") {
    parts.push("your system triggers Art. 50 transparency obligations");
  }

  if (obl.applies_to_roles?.includes("provider")) {
    parts.push("you are the provider");
  } else if (obl.applies_to_roles?.includes("deployer")) {
    parts.push("you are the deployer");
  }

  return parts.length > 0
    ? `This obligation applies because ${parts.join(" and ")}.`
    : "This obligation applies based on your classification profile.";
}
