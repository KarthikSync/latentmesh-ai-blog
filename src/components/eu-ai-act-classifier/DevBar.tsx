import { useState } from "preact/hooks";
import { SEEDS } from "../../data/eu-ai-act-classifier/seeds";
import type { AnswerSet, StepId } from "../../data/eu-ai-act-classifier/types";
import {
  clearAllDrafts,
  deleteDraft,
  listDrafts,
  saveDraft,
  type ClassifierView,
  type Draft,
} from "../../lib/eu-ai-act-classifier/devDrafts";

interface Props {
  answers: AnswerSet;
  currentStep: StepId;
  view: ClassifierView;
  onLoad: (answers: AnswerSet, currentStep: StepId, view: ClassifierView) => void;
}

export function DevBar({ answers, currentStep, view, onLoad }: Props) {
  const [drafts, setDrafts] = useState<Draft[]>(() => listDrafts());
  const [label, setLabel] = useState("");
  const [expanded, setExpanded] = useState(true);

  const refresh = () => setDrafts(listDrafts());

  const handleSave = () => {
    saveDraft(label, answers, currentStep, view);
    setLabel("");
    refresh();
  };

  const handleLoad = (draft: Draft) => {
    onLoad(draft.answers, draft.currentStep, draft.view);
  };

  const handleDelete = (id: string) => {
    deleteDraft(id);
    refresh();
  };

  const handleClearAll = () => {
    if (typeof window !== "undefined" && window.confirm("Clear all saved drafts?")) {
      clearAllDrafts();
      refresh();
    }
  };

  const handleSeed = (seedId: string) => {
    if (!seedId) return;
    const seed = SEEDS.find((s) => s.id === seedId);
    if (!seed) return;
    onLoad(seed.answers, "step0", "step");
  };

  return (
    <div className="cl-dev-bar" role="region" aria-label="Dev drafts">
      <button
        type="button"
        className="cl-dev-bar-toggle"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        {expanded ? "▼" : "▶"} DEV MODE · localStorage drafts
      </button>
      {expanded && (
        <div className="cl-dev-bar-body">
          <div className="cl-dev-bar-row">
            <label htmlFor="cl-dev-seed">Seed:</label>
            <select
              id="cl-dev-seed"
              onChange={(e) => handleSeed((e.target as HTMLSelectElement).value)}
              value=""
            >
              <option value="">— Choose a scenario —</option>
              {SEEDS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="cl-dev-bar-row">
            <input
              type="text"
              placeholder="Draft label (optional)"
              value={label}
              onInput={(e) => setLabel((e.target as HTMLInputElement).value)}
            />
            <button type="button" onClick={handleSave}>
              Save current state
            </button>
          </div>
          {drafts.length > 0 && (
            <div className="cl-dev-bar-drafts">
              {drafts.map((d) => (
                <div key={d.id} className="cl-dev-bar-draft">
                  <button
                    type="button"
                    className="cl-dev-bar-load"
                    onClick={() => handleLoad(d)}
                  >
                    {d.label}
                  </button>
                  <span className="cl-dev-bar-ts">
                    {new Date(d.createdAt).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    className="cl-dev-bar-del"
                    onClick={() => handleDelete(d.id)}
                    aria-label={`Delete ${d.label}`}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="cl-dev-bar-clear"
                onClick={handleClearAll}
              >
                Clear all drafts
              </button>
            </div>
          )}
          <p className="cl-dev-bar-note">
            Dev mode is active (?dev=1). Drafts are stored in this browser's localStorage only.
            Remove <code>?dev=1</code> from the URL to hide this bar.
          </p>
        </div>
      )}
    </div>
  );
}
