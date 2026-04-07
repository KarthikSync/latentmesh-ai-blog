import { useState } from "preact/hooks";
import type { Control } from "../../data/eu-ai-act-controls";

interface Props {
  control: Control;
}

export function ControlDetailRow({ control }: Props) {
  const [open, setOpen] = useState(false);
  const detailId = `d${control.id.replace("r", "")}`;

  const toggle = () => setOpen(!open);

  return (
    <>
      <tr className="data-row" onClick={toggle} style={{ cursor: "pointer" }}>
        <td data-label="Obligation">
          <span className="obl-name">{control.obligation}</span>
          <span className="art-ref">{control.articleRef}</span>
        </td>
        <td data-label="Role">
          <span className={`role-tag ${control.role.toLowerCase()}`}>
            {control.role}
          </span>
        </td>
        <td data-label="Control Objective">{control.controlObjective}</td>
        <td data-label="Eval / Verification">{control.evalVerification}</td>
        <td data-label="Evidence Artifact">{control.evidenceArtifact}</td>
        <td data-label="Owner">{control.owner}</td>
        <td data-label="Cadence">{control.cadence}</td>
        <td data-label="Frameworks">{control.frameworks}</td>
      </tr>
      <tr
        className={`detail-row ${open ? "open" : ""}`}
        id={detailId}
        role="region"
        aria-label="Details"
      >
        <td colSpan={8}>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Interpretation Notes</label>
              <p dangerouslySetInnerHTML={{ __html: control.interpretationNotes }} />
            </div>
            <div className="detail-item">
              <label>Cross-references</label>
              <p dangerouslySetInnerHTML={{ __html: control.crossReferences }} />
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}
