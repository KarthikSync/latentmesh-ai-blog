import { CLASSIFIER_SCHEMA } from "../../data/eu-ai-act-classifier/schema";
import type { StepId } from "../../data/eu-ai-act-classifier/types";

interface Props {
  reachable: StepId[];
  current: StepId;
}

// Map StepId → short label. step4_tier2 shares Step 4's label.
function shortLabel(step: StepId): string {
  if (step === "step4_tier2") return "Sub-use-case";
  const def = CLASSIFIER_SCHEMA.steps.find((s) => s.id === step);
  return def?.shortLabel ?? step;
}

export function ProgressIndicator({ reachable, current }: Props) {
  const currentIdx = reachable.indexOf(current);
  return (
    <nav className="cl-progress" aria-label="Assessment progress">
      {reachable.map((step, idx) => {
        const status = idx < currentIdx ? "cl-done" : idx === currentIdx ? "cl-current" : "";
        return (
          <span key={step} className="cl-progress-wrap">
            <span className={`cl-progress-step ${status}`} aria-current={idx === currentIdx ? "step" : undefined}>
              {shortLabel(step)}
            </span>
            {idx < reachable.length - 1 && <span className="cl-progress-sep"> › </span>}
          </span>
        );
      })}
    </nav>
  );
}
