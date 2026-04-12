import {
  CONFIDENCE_COPY,
  DEPLOYER_EXEMPT_NOTICE,
  MODEL_RESULT_SUMMARIES,
  OPEN_SOURCE_EXCLUSION_NOTICE,
  RESULT_SUMMARIES,
} from "../../data/eu-ai-act-classifier/copy";
import { CLASSIFIER_SCHEMA } from "../../data/eu-ai-act-classifier/schema";
import type { Result, SystemResult } from "../../data/eu-ai-act-classifier/types";
import { RoleQuestion } from "./RoleQuestion";
import { ObligationList } from "./ObligationList";

interface Props {
  result: Result;
  onRestart: () => void;
  onDownloadPdf: (role: string, substantiallyModified: boolean) => void;
  role: string | null;
  substantiallyModified: boolean | null;
  onRoleChange: (role: string) => void;
  onModifiedChange: (modified: boolean) => void;
}

const BADGE_CLASS: Record<SystemResult, string> = {
  not_ai_system: "cl-badge-neutral",
  out_of_scope: "cl-badge-minimal",
  prohibited: "cl-badge-prohibited",
  high_risk_annex_i: "cl-badge-high",
  high_risk_annex_iii: "cl-badge-high",
  limited_risk_transparency: "cl-badge-transparency",
  minimal_risk: "cl-badge-minimal",
};

const BADGE_ICON: Record<SystemResult, string> = {
  not_ai_system: "?",
  out_of_scope: "✓",
  prohibited: "⊘",
  high_risk_annex_i: "▲",
  high_risk_annex_iii: "▲",
  limited_risk_transparency: "ⓘ",
  minimal_risk: "✓",
};

const MODEL_BADGE_CLASS: Record<string, string> = {
  gpai: "cl-badge-transparency",
  gpai_systemic_risk: "cl-badge-high",
};

const MODEL_BADGE_ICON: Record<string, string> = {
  gpai: "◆",
  gpai_systemic_risk: "▲",
};

// Block 3 renders for these system_result values
const SYSTEM_OBLIGATION_RESULTS = new Set([
  "high_risk_annex_i",
  "high_risk_annex_iii",
  "limited_risk_transparency",
]);

export function ResultScreen({
  result,
  onRestart,
  onDownloadPdf,
  role,
  substantiallyModified,
  onRoleChange,
  onModifiedChange,
}: Props) {
  const systemLabel = CLASSIFIER_SCHEMA.displayLabels[result.system_result];
  const systemSummary = RESULT_SUMMARIES[result.system_result];
  const systemBadgeClass = BADGE_CLASS[result.system_result];
  const systemBadgeIcon = BADGE_ICON[result.system_result];

  const showModelTrack = result.model_result !== "none";
  const modelLabel = showModelTrack
    ? CLASSIFIER_SCHEMA.displayLabels[result.model_result]
    : "";
  const modelSummary = MODEL_RESULT_SUMMARIES[result.model_result] ?? "";
  const modelBadgeClass = MODEL_BADGE_CLASS[result.model_result] ?? "cl-badge-neutral";
  const modelBadgeIcon = MODEL_BADGE_ICON[result.model_result] ?? "◆";

  const confidence = CONFIDENCE_COPY[result.confidence];
  const showDeployerExempt = result.deployer_obligation_exempt;
  const showOpenSourceBanner = result.scope_status === "excluded_under_art_2_12";
  const showArt50 = result.article_50_transparency_triggers.length > 0;
  const showExceptionPanel = result.article_6_3_exception.checked;
  const showRoleQuestion = SYSTEM_OBLIGATION_RESULTS.has(result.system_result);

  // Obligation list renders when: role is selected (if Block 3 active), OR Block 4 only
  const showObligationList =
    (showRoleQuestion && role !== null) ||
    (!showRoleQuestion && result.model_result !== "none") ||
    (result.article_6_3_exception.checked && result.article_6_3_exception.applies);

  // Determine if we need track-specific deadlines
  const hasSystemDeadline = SYSTEM_OBLIGATION_RESULTS.has(result.system_result);
  const hasModelDeadline = showModelTrack;

  return (
    <div className="cl-result" role="region" aria-label="Assessment result">

      {/* ── Two-card result summary ────────────────────────────── */}
      <div className={`cl-result-cards ${showModelTrack ? "cl-result-cards-split" : ""}`}>
        {/* System track card */}
        <div className="cl-result-track-card">
          <span className="cl-result-track-label">System track</span>
          <div className={`cl-badge ${systemBadgeClass}`}>
            <span className="cl-badge-icon" aria-hidden="true">{systemBadgeIcon}</span>
            <span className="cl-badge-label">{systemLabel}</span>
          </div>
          <p className="cl-result-track-summary">{systemSummary}</p>
        </div>

        {/* Model track card (only when GPAI is applicable) */}
        {showModelTrack && (
          <div className="cl-result-track-card">
            <span className="cl-result-track-label">Model track</span>
            <div className={`cl-badge ${modelBadgeClass}`}>
              <span className="cl-badge-icon" aria-hidden="true">{modelBadgeIcon}</span>
              <span className="cl-badge-label">{modelLabel}</span>
            </div>
            <p className="cl-result-track-summary">{modelSummary}</p>
            {result.gpai_obligation_holder === "upstream_provider" && (
              <p className="cl-result-track-note">
                Obligations held by your upstream model provider, not directly by you.
              </p>
            )}
            {result.gpai_obligation_holder === "self" && (
              <p className="cl-result-track-note">
                You hold these obligations as the GPAI provider.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Banners ───────────────────────────────────────────── */}
      {showOpenSourceBanner && (
        <div className="cl-banner cl-banner-info">
          <strong>Open-source exclusion applied (Art. 2(12)):</strong>
          <p>{OPEN_SOURCE_EXCLUSION_NOTICE}</p>
        </div>
      )}
      {showDeployerExempt && (
        <div className="cl-banner cl-banner-info">
          <strong>Deployer obligations do not apply to you (Art. 2(10)):</strong>
          <p>{DEPLOYER_EXEMPT_NOTICE}</p>
        </div>
      )}

      {/* ── Triggering reasons ────────────────────────────────── */}
      {result.system_reasons.length > 0 && (
        <section className="cl-result-section">
          <h3>Why this classification</h3>
          <ul className="cl-reasons-list">
            {result.system_reasons.map((r) => (
              <li key={r.code}>
                <span className="cl-reason-label">{r.label}</span>
                <span className="cl-ref">{r.legal_ref}</span>
                <p className="cl-reason-expl">{r.plain_explanation}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Art. 6(3) exception panel ─────────────────────────── */}
      {showExceptionPanel && (
        <section className="cl-result-section">
          <h3>Article 6(3) exception test</h3>
          {result.article_6_3_exception.applies ? (
            <div className="cl-exception-pass">
              <p>
                <strong>Exception may apply.</strong> Based on your answers, this system may qualify for
                the Art. 6(3) exception and exit high-risk classification.
              </p>
              <p className="cl-exception-obligation">
                <strong>Provider obligations:</strong> you must document this assessment before placing
                the system on the market (Art. 6(4)) and register the system in the EU database under
                Article 49(2). Documentation must be made available to national competent authorities
                on request. There is no proactive notification duty.
              </p>
            </div>
          ) : (
            <p>
              <strong>Exception does not apply.</strong>{" "}
              {result.article_6_3_exception.reason ?? "One or more exception conditions failed."}
            </p>
          )}
        </section>
      )}

      {/* ── Art. 50 transparency triggers ─────────────────────── */}
      {showArt50 && (
        <section className="cl-result-section">
          <h3>Article 50 transparency obligations</h3>
          <ul className="cl-reasons-list">
            {result.article_50_transparency_triggers.map((t) => (
              <li key={t.trigger}>
                <span className="cl-reason-label">{t.obligation}</span>
                <span className="cl-ref">{t.article}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Track-specific deadlines ──────────────────────────── */}
      <section className="cl-result-section">
        <h3>{hasSystemDeadline && hasModelDeadline ? "Compliance deadlines" : "Compliance deadline"}</h3>
        {hasSystemDeadline && (
          <div className="cl-deadline-row">
            {hasModelDeadline && <span className="cl-deadline-track">System:</span>}
            <strong>{result.timing.compliance_deadline}</strong>
            {result.timing.rules_enforceable_now && " — enforceable now"}
            {result.timing.public_authority_deadline && (
              <p className="cl-result-note">
                Public authority legacy deadline: {result.timing.public_authority_deadline}
              </p>
            )}
          </div>
        )}
        {hasModelDeadline && (
          <div className="cl-deadline-row">
            {hasSystemDeadline && <span className="cl-deadline-track">Model:</span>}
            <strong>2025-08-02</strong> — enforceable now
            {result.timing.gpai_legacy_deadline && (
              <p className="cl-result-note">
                Legacy model compliance deadline: {result.timing.gpai_legacy_deadline}
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── Role question (system track only) ─────────────────── */}
      {showRoleQuestion && (
        <RoleQuestion
          result={result}
          role={role}
          substantiallyModified={substantiallyModified}
          onRoleChange={onRoleChange}
          onModifiedChange={onModifiedChange}
        />
      )}

      {/* ── Obligation list ───────────────────────────────────── */}
      {showObligationList && (
        <ObligationList
          result={result}
          role={role ?? "Provider"}
          substantiallyModified={substantiallyModified === true}
        />
      )}

      {/* Model-only case when no system obligations but GPAI active */}
      {!showRoleQuestion && result.model_result !== "none" && !showObligationList && (
        <ObligationList
          result={result}
          role="Provider"
          substantiallyModified={false}
        />
      )}

      {/* ── Confidence ────────────────────────────────────────── */}
      <section className="cl-result-section cl-confidence">
        <h3>Confidence</h3>
        <p>
          <strong>{confidence.label}</strong> — {confidence.explanation}
        </p>
        {result.unsure_fields.length > 0 && (
          <p className="cl-result-note">
            Questions answered "unsure": {result.unsure_fields.join(", ")}
          </p>
        )}
      </section>

      {/* ── Actions ───────────────────────────────────────────── */}
      <div className="cl-result-actions">
        <button
          type="button"
          className="cl-btn-primary"
          onClick={() => onDownloadPdf(role ?? "Provider", substantiallyModified === true)}
        >
          Download PDF report
        </button>
        <button type="button" className="cl-btn-secondary" onClick={onRestart}>
          Start over
        </button>
      </div>

      <p className="cl-disclaimer">
        This is a preliminary assessment only and is not legal advice. For binding interpretation of
        your obligations under the EU AI Act, consult qualified legal counsel.
      </p>
    </div>
  );
}
