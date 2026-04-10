import { useMemo, useState } from "preact/hooks";
import { CLASSIFIER_SCHEMA } from "../../data/eu-ai-act-classifier/schema";
import { classify } from "../../lib/eu-ai-act-classifier/engine";
import {
  clearFieldsAfter,
  nextStep,
  previousStep,
  reachableSteps,
} from "../../lib/eu-ai-act-classifier/navigation";
import type {
  AnswerSet,
  AnswerValue,
  StepId,
} from "../../data/eu-ai-act-classifier/types";
import { LandingScreen } from "./LandingScreen";
import { QuestionCard } from "./QuestionCard";
import { ProgressIndicator } from "./ProgressIndicator";
import { EarlyExitScreen } from "./EarlyExitScreen";

type View = "landing" | "step" | "result";

const EARLY_EXIT_RESULTS = new Set(["not_ai_system", "out_of_scope", "prohibited"]);

// gtag helper — matches the pattern in controls-grid/csvExport.ts
function track(event: string, data: Record<string, unknown>): void {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", event, data);
  }
}

export default function Classifier() {
  const [view, setView] = useState<View>("landing");
  const [currentStep, setCurrentStep] = useState<StepId>("step0");
  const [answers, setAnswers] = useState<AnswerSet>({});
  const [showLegalRefs, setShowLegalRefs] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const reachable = useMemo(() => reachableSteps(answers), [answers]);

  const stepDef = useMemo(
    () => CLASSIFIER_SCHEMA.steps.find((s) => s.id === currentStep) ?? null,
    [currentStep]
  );

  // Only render questions whose showIf predicate passes
  const visibleQuestions = useMemo(() => {
    if (!stepDef) return [];
    return stepDef.questions.filter((q) => !q.showIf || q.showIf(answers));
  }, [stepDef, answers]);

  const allVisibleAnswered = useMemo(
    () =>
      visibleQuestions.every((q) => {
        const v = answers[q.id];
        return v !== undefined && v !== null && v !== "";
      }),
    [visibleQuestions, answers]
  );

  const handleStart = () => {
    setView("step");
    setCurrentStep("step0");
    setStartedAt(Date.now());
    track("assessment_started", {});
  };

  const handleAnswer = (fieldId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleContinue = () => {
    if (!allVisibleAnswered) return;
    track("step_completed", {
      step_id: currentStep,
      has_unsure: visibleQuestions.some((q) => answers[q.id] === "unsure"),
    });
    const next = nextStep(currentStep, answers);
    if (next === "result") {
      setView("result");
    } else {
      setCurrentStep(next);
    }
  };

  const handleBack = () => {
    const prev = previousStep(currentStep, answers);
    if (!prev) return;
    // Clear any answers from the current step onward so the user can re-answer fresh
    setAnswers((a) => clearFieldsAfter(a, prev));
    setCurrentStep(prev);
  };

  const handleRestart = () => {
    setAnswers({});
    setView("landing");
    setCurrentStep("step0");
    setStartedAt(null);
  };

  // Compute result lazily when we enter the result view
  const result = useMemo(() => (view === "result" ? classify(answers) : null), [view, answers]);

  if (view === "landing") {
    return (
      <div className="classifier-container">
        <LandingScreen onStart={handleStart} />
      </div>
    );
  }

  if (view === "result" && result) {
    // Early-exit presentation for terminal states
    if (EARLY_EXIT_RESULTS.has(result.system_result)) {
      track("early_exit", { step_id: currentStep, result: result.system_result });
      return (
        <div className="classifier-container">
          <EarlyExitScreen result={result} onRestart={handleRestart} />
        </div>
      );
    }
    // Full ResultScreen is built in the next milestone — placeholder for now
    return (
      <div className="classifier-container">
        <div className="cl-result-placeholder">
          <h2>Assessment complete</h2>
          <p>
            Classification: <strong>{result.system_result}</strong>
            {result.model_result !== "none" && <> · Model: <strong>{result.model_result}</strong></>}
          </p>
          <p>The full result screen is being built in the next milestone.</p>
          <button type="button" className="cl-btn-primary" onClick={handleRestart}>
            Start over
          </button>
        </div>
      </div>
    );
  }

  // view === "step"
  if (!stepDef) {
    return <div className="classifier-container">Unknown step.</div>;
  }

  return (
    <div className="classifier-container">
      <ProgressIndicator reachable={reachable} current={currentStep} />

      <h1>{stepDef.title}</h1>
      {stepDef.intro && <p className="cl-step-intro">{stepDef.intro}</p>}

      {visibleQuestions.length === 0 && stepDef.id !== "step2" && stepDef.id !== "step4_tier1" && (
        <p className="cl-question-helper">No questions apply to this step for your situation.</p>
      )}

      {visibleQuestions.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          value={answers[q.id] ?? null}
          onChange={(v) => handleAnswer(q.id, v)}
          showLegalRefs={showLegalRefs}
          onLegalToggle={() => {
            if (!showLegalRefs) {
              track("legal_toggle_activated", { step_id: currentStep });
            }
            setShowLegalRefs((s) => !s);
          }}
        />
      ))}

      <div className="cl-step-nav">
        <button
          type="button"
          className="cl-btn-secondary"
          onClick={handleBack}
          disabled={currentStep === "step0"}
        >
          ← Back
        </button>
        <div className="cl-step-nav-right">
          <button
            type="button"
            className="cl-btn-primary"
            onClick={handleContinue}
            disabled={!allVisibleAnswered}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
