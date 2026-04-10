import { RESULT_SUMMARIES } from "../../data/eu-ai-act-classifier/copy";
import { CLASSIFIER_SCHEMA } from "../../data/eu-ai-act-classifier/schema";
import type { Result, SystemResult } from "../../data/eu-ai-act-classifier/types";

interface Props {
  result: Result;
  onRestart: () => void;
  onDownloadPdf: () => void;
}

const ICON_CLASSES: Record<string, string> = {
  not_ai_system: "cl-not-ai-system",
  out_of_scope: "cl-out-of-scope",
  prohibited: "cl-prohibited",
};

const ICON_GLYPH: Record<string, string> = {
  not_ai_system: "?",
  out_of_scope: "✓",
  prohibited: "⊘",
};

export function EarlyExitScreen({ result, onRestart, onDownloadPdf }: Props) {
  const systemResult = result.system_result as SystemResult;
  const label = CLASSIFIER_SCHEMA.displayLabels[systemResult];
  const summary = RESULT_SUMMARIES[systemResult];
  const iconClass = ICON_CLASSES[systemResult] ?? "";
  const iconGlyph = ICON_GLYPH[systemResult] ?? "!";

  return (
    <div className="cl-early-exit" role="region" aria-label="Assessment result">
      <div className={`cl-early-exit-icon ${iconClass}`} aria-hidden="true">
        {iconGlyph}
      </div>
      <h2>{label}</h2>
      <p className="cl-early-exit-summary">{summary}</p>

      {result.system_reasons.length > 0 && (
        <div className="cl-early-exit-reasons">
          <h3>Why</h3>
          <ul>
            {result.system_reasons.map((r) => (
              <li key={r.code}>
                {r.plain_explanation}
                <span className="cl-ref">{r.legal_ref}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="cl-early-exit-caveat">
        This is a preliminary assessment. It is not legal advice. If your circumstances change
        (for example, you start serving EU users, or the system moves from research to production),
        reassess.
      </p>

      <div className="cl-early-exit-actions">
        <button type="button" className="cl-btn-primary" onClick={onDownloadPdf}>
          Download PDF report
        </button>
        <button type="button" className="cl-btn-secondary" onClick={onRestart}>
          Start over
        </button>
      </div>
    </div>
  );
}
