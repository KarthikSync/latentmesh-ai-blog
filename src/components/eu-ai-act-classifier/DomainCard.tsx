import type { DomainDef } from "../../data/eu-ai-act-classifier/types";

interface Props {
  domain: DomainDef;
  selected: boolean;
  onToggle: () => void;
}

export function DomainCard({ domain, selected, onToggle }: Props) {
  return (
    <button
      type="button"
      className={`cl-domain-card ${selected ? "cl-selected" : ""}`}
      onClick={onToggle}
      role="checkbox"
      aria-checked={selected}
    >
      <div className="cl-domain-header">
        <span className="cl-domain-checkbox" aria-hidden="true">
          {selected ? "☑" : "☐"}
        </span>
        <div className="cl-domain-meta">
          <p className="cl-domain-title">{domain.title}</p>
          <p className="cl-domain-annex">{domain.annexPoint}</p>
        </div>
      </div>
      <p className="cl-domain-description">{domain.description}</p>
      {domain.triggers.length > 0 && (
        <div className="cl-domain-triggers">
          <span className="cl-domain-triggers-label">Examples:</span>
          <ul>
            {domain.triggers.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </button>
  );
}
