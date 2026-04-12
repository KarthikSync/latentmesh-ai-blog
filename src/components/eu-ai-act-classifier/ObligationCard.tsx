// Individual obligation card — used in Blocks 2, 3, and 4.
// Expandable sections for "Why this applies" and "Priority reasoning".
// Adapts actor indicator and open-source note based on track.

import { useState } from "preact/hooks";
import type { RenderedObligation } from "../../data/eu-ai-act-classifier/obligation-types";

interface Props {
  obligation: RenderedObligation;
  showOpenSourceNote?: boolean;
  isUpstreamProvider?: boolean;
}

const PRIORITY_CLASSES: Record<string, string> = {
  high: "cl-obl-priority-high",
  medium: "cl-obl-priority-medium",
  standard: "cl-obl-priority-standard",
};

export function ObligationCard({
  obligation,
  showOpenSourceNote = false,
  isUpstreamProvider = false,
}: Props) {
  const [whyExpanded, setWhyExpanded] = useState(false);
  const [priorityExpanded, setPriorityExpanded] = useState(false);

  const priorityClass = PRIORITY_CLASSES[obligation.priority_label] ?? "cl-obl-priority-standard";

  // Actor indicator
  let actorText = "";
  if (obligation.obligation_track === "model") {
    actorText = isUpstreamProvider ? "Upstream Provider" : "GPAI Provider";
  } else if (obligation.applies_to_roles) {
    if (obligation.applies_to_roles.includes("provider") && obligation.applies_to_roles.includes("deployer")) {
      actorText = "Provider + Deployer";
    } else if (obligation.applies_to_roles.includes("provider")) {
      actorText = "Provider";
    } else if (obligation.applies_to_roles.includes("deployer")) {
      actorText = "Deployer";
    }
  }

  return (
    <div className="cl-obl-card">
      <div className="cl-obl-card-header">
        <span className={`cl-obl-priority ${priorityClass}`}>
          {obligation.priority_label}
        </span>
        <span className="cl-obl-date">
          {obligation.display_effective_from}
          {obligation.enforceable_now && (
            <span className="cl-obl-enforceable"> Enforceable now</span>
          )}
        </span>
      </div>

      <p className="cl-obl-requirement">{obligation.plain_language_requirement}</p>

      <div className="cl-obl-meta">
        <span className="cl-obl-source">
          {obligation.legal_source.eur_lex_url ? (
            <a
              href={obligation.legal_source.eur_lex_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {obligation.source_code}
            </a>
          ) : (
            obligation.source_code
          )}
        </span>
        {actorText && <span className="cl-obl-actor">{actorText}</span>}
      </div>

      {showOpenSourceNote && obligation.model_applicability?.open_source_note && (
        <div className="cl-obl-oss-note">
          {obligation.model_applicability.open_source_note}
        </div>
      )}

      <div className="cl-obl-expandables">
        <button
          type="button"
          className="cl-obl-expand-btn"
          onClick={() => setWhyExpanded((v) => !v)}
          aria-expanded={whyExpanded}
        >
          {whyExpanded ? "▾ Hide" : "▸ Why this applies to you"}
        </button>
        {whyExpanded && (
          <p className="cl-obl-expand-content">{obligation.why_applies}</p>
        )}

        <button
          type="button"
          className="cl-obl-expand-btn"
          onClick={() => setPriorityExpanded((v) => !v)}
          aria-expanded={priorityExpanded}
        >
          {priorityExpanded ? "▾ Hide" : "▸ Priority reasoning"}
        </button>
        {priorityExpanded && (
          <p className="cl-obl-expand-content">{obligation.priority_reason}</p>
        )}
      </div>
    </div>
  );
}
