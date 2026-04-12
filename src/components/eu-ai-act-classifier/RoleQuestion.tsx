// Post-classification role question — gates Block 3 (system obligations).
// Three cards: Provider / Deployer / Both.
// When Deployer or Both is selected AND system is high-risk, shows a
// conditional follow-up about substantial modification (Art. 25(1)(c)).

import type { Result } from "../../data/eu-ai-act-classifier/types";

interface Props {
  result: Result;
  role: string | null; // "Provider" | "Deployer" | "Both" | null
  substantiallyModified: boolean | null;
  onRoleChange: (role: string) => void;
  onModifiedChange: (modified: boolean) => void;
}

const ROLE_OPTIONS = [
  {
    value: "Provider",
    label: "We built it",
    description: "You are the company that developed or placed this AI system on the market.",
  },
  {
    value: "Deployer",
    label: "We deploy it",
    description: "You are using an AI system built by someone else.",
  },
  {
    value: "Both",
    label: "Both",
    description: "You both built and deploy the system, or you are both the provider and deployer.",
  },
];

const HIGH_RISK_RESULTS = new Set(["high_risk_annex_i", "high_risk_annex_iii"]);

export function RoleQuestion({
  result,
  role,
  substantiallyModified,
  onRoleChange,
  onModifiedChange,
}: Props) {
  const showModificationFollowUp =
    (role === "Deployer" || role === "Both") &&
    HIGH_RISK_RESULTS.has(result.system_result);

  return (
    <div className="cl-role-question" role="group" aria-label="Your role">
      <h3 className="cl-role-title">Your role</h3>
      <p className="cl-role-prompt">
        Are you the company that built this AI system, or are you deploying one built by someone else?
      </p>

      <div className="cl-role-cards">
        {ROLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={role === opt.value}
            className={`cl-role-card ${role === opt.value ? "cl-selected" : ""}`}
            onClick={() => onRoleChange(opt.value)}
          >
            <span className="cl-role-card-label">{opt.label}</span>
            <span className="cl-role-card-desc">{opt.description}</span>
          </button>
        ))}
      </div>

      {showModificationFollowUp && (
        <div className="cl-modification-followup" role="group" aria-label="Substantial modification check">
          <p className="cl-modification-prompt">
            Have you substantially modified this high-risk AI system before putting it into service?
          </p>
          <p className="cl-modification-helper">
            Under Article 25, a deployer who substantially modifies a high-risk system may take on
            provider obligations. A substantial modification is one that changes the system's intended
            purpose or significantly affects its compliance with Chapter III requirements.
          </p>
          <div className="cl-role-cards cl-role-cards-small">
            <button
              type="button"
              role="radio"
              aria-checked={substantiallyModified === true}
              className={`cl-role-card cl-role-card-sm ${substantiallyModified === true ? "cl-selected" : ""}`}
              onClick={() => onModifiedChange(true)}
            >
              Yes
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={substantiallyModified === false}
              className={`cl-role-card cl-role-card-sm ${substantiallyModified === false ? "cl-selected" : ""}`}
              onClick={() => onModifiedChange(false)}
            >
              No
            </button>
          </div>
          {substantiallyModified === true && (
            <div className="cl-modification-note" role="alert">
              <strong>Note:</strong> Because you substantially modified this system, you may be treated
              as a provider under Article 25(1)(c). Your obligations below reflect provider duties.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
