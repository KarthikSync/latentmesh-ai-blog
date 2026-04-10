import { useState } from "preact/hooks";
import type {
  AnswerValue,
  QuestionDef,
} from "../../data/eu-ai-act-classifier/types";

interface Props {
  question: QuestionDef;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  showLegalRefs: boolean;
  onLegalToggle?: () => void;
}

export function QuestionCard({
  question,
  value,
  onChange,
  showLegalRefs,
  onLegalToggle,
}: Props) {
  const [expandedLegal, setExpandedLegal] = useState(false);

  const handleToggleLegal = () => {
    setExpandedLegal((v) => !v);
    onLegalToggle?.();
  };

  const isAnswered = value !== undefined && value !== null && value !== "";

  const renderYesNoOptions = (includeUnsure: boolean) => {
    const options = [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ];
    if (includeUnsure) options.push({ value: "unsure", label: "I'm not sure" });

    return (
      <div className="cl-question-options" role="radiogroup">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            className={`cl-option-btn ${value === opt.value ? "cl-selected" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  };

  const renderSingleSelect = () => {
    const options = question.options ?? [];
    return (
      <div className="cl-question-options" role="radiogroup">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            className={`cl-option-btn ${value === opt.value ? "cl-selected" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            <span>{opt.label}</span>
            {opt.subLabel && <span className="cl-option-sub">{opt.subLabel}</span>}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`cl-question-card ${isAnswered ? "cl-answered" : ""}`}>
      <p className="cl-question-prompt">{question.prompt}</p>
      {question.why && <p className="cl-question-why">{question.why}</p>}
      {question.helper && <p className="cl-question-helper">{question.helper}</p>}

      {question.type === "yes_no" && renderYesNoOptions(false)}
      {question.type === "yes_no_unsure" && renderYesNoOptions(true)}
      {question.type === "single_select" && renderSingleSelect()}

      <button
        type="button"
        className="cl-question-legal-toggle"
        onClick={handleToggleLegal}
        aria-expanded={expandedLegal || showLegalRefs}
      >
        {expandedLegal || showLegalRefs
          ? "Hide legal reference"
          : "Show legal reference"}
      </button>
      {(expandedLegal || showLegalRefs) && (
        <div className="cl-question-legal">
          <strong>{question.legal.article}</strong>
          {question.legal.recital ? ` · ${question.legal.recital}` : ""}
          {question.legal.quote && (
            <>
              <br />
              {question.legal.quote}
            </>
          )}
        </div>
      )}
    </div>
  );
}
