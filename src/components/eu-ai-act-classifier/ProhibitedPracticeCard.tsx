import { useState } from "preact/hooks";
import type {
  AnswerSet,
  AnswerValue,
  ProhibitedPracticeDef,
} from "../../data/eu-ai-act-classifier/types";

interface Props {
  practice: ProhibitedPracticeDef;
  answers: AnswerSet;
  onChange: (fieldId: string, value: AnswerValue) => void;
  showLegalRefs: boolean;
}

export function ProhibitedPracticeCard({
  practice,
  answers,
  onChange,
  showLegalRefs,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [legalExpanded, setLegalExpanded] = useState(false);

  const value = answers[practice.id];
  const practiceAnswered = value === "yes" || value === "no";
  const hasExceptions = practice.exceptions.length > 0;
  const showExceptions = value === "yes" && hasExceptions;

  const renderYesNo = (fieldId: string, currentValue: AnswerValue) => (
    <div className="cl-question-options" role="radiogroup">
      <button
        type="button"
        role="radio"
        aria-checked={currentValue === "yes"}
        className={`cl-option-btn ${currentValue === "yes" ? "cl-selected" : ""}`}
        onClick={() => onChange(fieldId, "yes")}
      >
        Yes
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={currentValue === "no"}
        className={`cl-option-btn ${currentValue === "no" ? "cl-selected" : ""}`}
        onClick={() => onChange(fieldId, "no")}
      >
        No
      </button>
    </div>
  );

  return (
    <div className={`cl-practice-card ${practiceAnswered ? "cl-answered" : ""}`}>
      <div className="cl-practice-header">
        <span className="cl-practice-icon" aria-hidden="true">⚠</span>
        <div className="cl-practice-meta">
          <p className="cl-practice-name">{practice.name}</p>
          <p className="cl-practice-summary">{practice.summary}</p>
        </div>
      </div>

      <button
        type="button"
        className="cl-practice-disclosure"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {expanded ? "Hide examples" : "Show examples"}
      </button>

      {expanded && (
        <div className="cl-practice-examples">
          <div className="cl-example">
            <span className="cl-example-tag cl-example-yes">Counts:</span>
            <span>{practice.exampleYes}</span>
          </div>
          <div className="cl-example">
            <span className="cl-example-tag cl-example-no">Doesn't count:</span>
            <span>{practice.exampleNo}</span>
          </div>
        </div>
      )}

      <div className="cl-practice-question">
        <span className="cl-practice-label">Does this apply to your system?</span>
        {renderYesNo(practice.id, value)}
      </div>

      {showExceptions && (
        <div className="cl-practice-exceptions" role="group" aria-label="Exception questions">
          <p className="cl-practice-exception-intro">
            This practice has {practice.exceptions.length === 1 ? "an exception" : "narrow exceptions"}.
            If any apply, the prohibition does not.
          </p>
          {practice.exceptions.map((exc) => (
            <div key={exc.id} className="cl-practice-exception">
              <p className="cl-practice-exception-q">{exc.question}</p>
              {exc.helper && <p className="cl-practice-exception-helper">{exc.helper}</p>}
              {renderYesNo(exc.id, answers[exc.id])}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="cl-question-legal-toggle"
        onClick={() => setLegalExpanded((v) => !v)}
        aria-expanded={legalExpanded || showLegalRefs}
      >
        {legalExpanded || showLegalRefs ? "Hide legal reference" : "Show legal reference"}
      </button>
      {(legalExpanded || showLegalRefs) && (
        <div className="cl-question-legal">
          <strong>{practice.legal.article}</strong>
        </div>
      )}
    </div>
  );
}
