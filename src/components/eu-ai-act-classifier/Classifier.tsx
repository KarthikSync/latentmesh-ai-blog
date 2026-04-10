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
import { ProhibitedPracticeCard } from "./ProhibitedPracticeCard";
import { DomainCard } from "./DomainCard";
import { ResultScreen } from "./ResultScreen";
import { downloadResultPdf } from "./pdfExport";
import { DevBar } from "./DevBar";
import {
  getSeedParam,
  isDevMode,
  type ClassifierView,
} from "../../lib/eu-ai-act-classifier/devDrafts";
import { findSeed } from "../../data/eu-ai-act-classifier/seeds";

type View = ClassifierView;

const EARLY_EXIT_RESULTS = new Set(["not_ai_system", "out_of_scope", "prohibited"]);

// gtag helper — matches the pattern in controls-grid/csvExport.ts
function track(event: string, data: Record<string, unknown>): void {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", event, data);
  }
}

// Look up an initial seed from ?seed=<id> on page load. Runs once at
// module-eval time inside the component's lazy initializer.
function getInitialStateFromSeed():
  | { view: View; currentStep: StepId; answers: AnswerSet }
  | null {
  const seedId = getSeedParam();
  if (!seedId) return null;
  const seed = findSeed(seedId);
  if (!seed) return null;
  return { view: "step", currentStep: "step0", answers: { ...seed.answers } };
}

export default function Classifier() {
  const seeded = useMemo(() => getInitialStateFromSeed(), []);
  const devMode = useMemo(() => isDevMode(), []);

  const [view, setView] = useState<View>(seeded?.view ?? "landing");
  const [currentStep, setCurrentStep] = useState<StepId>(seeded?.currentStep ?? "step0");
  const [answers, setAnswers] = useState<AnswerSet>(seeded?.answers ?? {});
  const [showLegalRefs, setShowLegalRefs] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(seeded ? Date.now() : null);

  const reachable = useMemo(() => reachableSteps(answers), [answers]);

  // step4_tier2 is a virtual sub-screen — render uses STEP_4's domains directly
  const stepDef = useMemo(() => {
    if (currentStep === "step4_tier2") {
      return CLASSIFIER_SCHEMA.steps.find((s) => s.id === "step4_tier1") ?? null;
    }
    return CLASSIFIER_SCHEMA.steps.find((s) => s.id === currentStep) ?? null;
  }, [currentStep]);

  const selectedDomains = useMemo(() => {
    const v = answers.selected_domains;
    return Array.isArray(v) ? (v as string[]) : [];
  }, [answers.selected_domains]);

  const selectedDomainDefs = useMemo(() => {
    const allDomains = stepDef?.domains ?? [];
    return selectedDomains
      .map((id) => allDomains.find((d) => d.id === id))
      .filter((d): d is NonNullable<typeof d> => !!d);
  }, [selectedDomains, stepDef]);

  const toggleDomain = (domainId: string) => {
    const current = selectedDomains;
    const next = current.includes(domainId)
      ? current.filter((d) => d !== domainId)
      : [...current, domainId];
    setAnswers((prev) => ({ ...prev, selected_domains: next }));
  };

  const toggleSubUseCase = (sucId: string) => {
    const current = answers[sucId];
    const nextValue = current === "yes" ? "no" : "yes";
    setAnswers((prev) => ({ ...prev, [sucId]: nextValue }));
  };

  // Only render questions whose showIf predicate passes
  const visibleQuestions = useMemo(() => {
    if (!stepDef) return [];
    return stepDef.questions.filter((q) => !q.showIf || q.showIf(answers));
  }, [stepDef, answers]);

  // For step2 (prohibited practices), we validate practice answers + exceptions
  // instead of the empty questions array.
  const step2PracticesAllAnswered = useMemo(() => {
    if (currentStep !== "step2" || !stepDef?.prohibitedPractices) return true;
    return stepDef.prohibitedPractices.every((p) => {
      const v = answers[p.id];
      if (v !== "yes" && v !== "no") return false;
      if (v === "yes" && p.exceptions.length > 0) {
        // At least one exception must be answered (either yes = exception met,
        // or all no = prohibition stands). We require every exception to have an answer.
        return p.exceptions.every((exc) => {
          const ev = answers[exc.id];
          return ev === "yes" || ev === "no";
        });
      }
      return true;
    });
  }, [currentStep, stepDef, answers]);

  const allVisibleAnswered = useMemo(() => {
    if (currentStep === "step2") return step2PracticesAllAnswered;
    // step4_tier1 + step4_tier2: no hard requirement — user can proceed with
    // zero selections (which just means no Annex III match).
    if (currentStep === "step4_tier1") return true;
    if (currentStep === "step4_tier2") return true;
    return visibleQuestions.every((q) => {
      const v = answers[q.id];
      return v !== undefined && v !== null && v !== "";
    });
  }, [currentStep, step2PracticesAllAnswered, visibleQuestions, answers]);

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

  // Dev-only: load a saved draft or a seed scenario into the component state
  const handleDevLoad = (
    newAnswers: AnswerSet,
    newStep: StepId,
    newView: View
  ) => {
    setAnswers(newAnswers);
    setCurrentStep(newStep);
    setView(newView);
    if (newView !== "landing" && !startedAt) setStartedAt(Date.now());
  };

  // Compute result lazily when we enter the result view
  const result = useMemo(() => (view === "result" ? classify(answers) : null), [view, answers]);

  const devBar = devMode ? (
    <DevBar
      answers={answers}
      currentStep={currentStep}
      view={view}
      onLoad={handleDevLoad}
    />
  ) : null;

  if (view === "landing") {
    return (
      <div className="classifier-container">
        {devBar}
        <LandingScreen onStart={handleStart} />
      </div>
    );
  }

  if (view === "result" && result) {
    // Early-exit presentation for terminal states (not_ai_system, out_of_scope, prohibited)
    if (EARLY_EXIT_RESULTS.has(result.system_result)) {
      track("early_exit", { step_id: currentStep, result: result.system_result });
      return (
        <div className="classifier-container">
          {devBar}
          <EarlyExitScreen
            result={result}
            onRestart={handleRestart}
            onDownloadPdf={() => {
              void downloadResultPdf(result);
            }}
          />
        </div>
      );
    }

    // Full result screen
    if (startedAt) {
      track("assessment_completed", {
        system_result: result.system_result,
        model_result: result.model_result,
        confidence: result.confidence,
        duration_seconds: Math.round((Date.now() - startedAt) / 1000),
      });
    }

    return (
      <div className="classifier-container">
        {devBar}
        <ResultScreen
          result={result}
          onRestart={handleRestart}
          onDownloadPdf={() => {
            void downloadResultPdf(result);
          }}
        />
      </div>
    );
  }

  // view === "step"
  if (!stepDef) {
    return <div className="classifier-container">{devBar}Unknown step.</div>;
  }

  return (
    <div className="classifier-container">
      {devBar}
      <ProgressIndicator reachable={reachable} current={currentStep} />

      <h1>
        {currentStep === "step4_tier2"
          ? "Which specific use cases apply?"
          : stepDef.title}
      </h1>
      {currentStep === "step4_tier2" ? (
        <p className="cl-step-intro">
          For each domain you selected, tick the specific sub-use-cases that match your system. Leave
          unchecked any that do not apply.
        </p>
      ) : (
        stepDef.intro && <p className="cl-step-intro">{stepDef.intro}</p>
      )}

      {currentStep === "step4_tier1" && stepDef.domains && (
        <div className="cl-domains-grid">
          {stepDef.domains.map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              selected={selectedDomains.includes(domain.id)}
              onToggle={() => toggleDomain(domain.id)}
            />
          ))}
        </div>
      )}

      {currentStep === "step4_tier2" && (
        <div className="cl-suc-all">
          {selectedDomainDefs.length === 0 && (
            <p className="cl-question-helper">
              You didn't select any domains. Go back to pick one, or continue — your system will not be
              classified under Annex III.
            </p>
          )}
          {selectedDomainDefs.map((domain) => (
            <div key={domain.id} className="cl-suc-domain-block">
              <p className="cl-suc-domain-title">{domain.title}</p>
              {domain.subUseCases.map((suc) => {
                const isSelected = answers[suc.id] === "yes";
                return (
                  <div key={suc.id} className="cl-suc-row">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      className={`cl-suc-checkbox ${isSelected ? "cl-selected" : ""}`}
                      onClick={() => toggleSubUseCase(suc.id)}
                      aria-label={suc.label}
                    >
                      {isSelected ? "✓" : ""}
                    </button>
                    <div className="cl-suc-body">
                      <label
                        className="cl-suc-label"
                        onClick={() => toggleSubUseCase(suc.id)}
                      >
                        {suc.label}
                      </label>
                      <p className="cl-suc-helper">{suc.helper}</p>
                      <span className="cl-suc-annex">Annex III · {suc.annexRef}</span>
                      {suc.isExclusionGate && (
                        <div className="cl-suc-exclusion-gate">
                          <strong>Exclusion gate:</strong> ticking this excludes related sub-use-cases from
                          high-risk under the Act.
                        </div>
                      )}
                      {suc.crossRef && (
                        <div className="cl-suc-cross-ref" role="alert">
                          <strong>⚠ {suc.crossRef.article}:</strong> {suc.crossRef.note}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {currentStep === "step2" && stepDef.prohibitedPractices && (
        <div className="cl-practices-list">
          {stepDef.prohibitedPractices.map((p) => (
            <ProhibitedPracticeCard
              key={p.id}
              practice={p}
              answers={answers}
              onChange={handleAnswer}
              showLegalRefs={showLegalRefs}
            />
          ))}
        </div>
      )}

      {currentStep !== "step2" &&
        currentStep !== "step4_tier1" &&
        currentStep !== "step4_tier2" &&
        visibleQuestions.length === 0 && (
          <p className="cl-question-helper">No questions apply to this step for your situation.</p>
        )}

      {currentStep !== "step2" &&
        currentStep !== "step4_tier1" &&
        currentStep !== "step4_tier2" &&
        visibleQuestions.map((q) => (
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
          Back
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
