import {
  CONFIDENCE_COPY,
  DEPLOYER_EXEMPT_NOTICE,
  OPEN_SOURCE_EXCLUSION_NOTICE,
  RESULT_SUMMARIES,
} from "../../data/eu-ai-act-classifier/copy";
import { CLASSIFIER_SCHEMA } from "../../data/eu-ai-act-classifier/schema";
import type { Result, SystemResult } from "../../data/eu-ai-act-classifier/types";

interface Props {
  result: Result;
  onRestart: () => void;
  onDownloadPdf: () => void;
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

export function ResultScreen({ result, onRestart, onDownloadPdf }: Props) {
  const label = CLASSIFIER_SCHEMA.displayLabels[result.system_result];
  const summary = RESULT_SUMMARIES[result.system_result];
  const badgeClass = BADGE_CLASS[result.system_result];
  const badgeIcon = BADGE_ICON[result.system_result];

  const confidence = CONFIDENCE_COPY[result.confidence];

  const showDeployerExempt = result.deployer_obligation_exempt;
  const showOpenSourceBanner = result.scope_status === "excluded_under_art_2_12";
  const showGpaiPanel = result.model_result !== "none";
  const showArt50 = result.article_50_transparency_triggers.length > 0;
  const showExceptionPanel = result.article_6_3_exception.checked;

  return (
    <div className="cl-result" role="region" aria-label="Assessment result">
      {/* Classification badge */}
      <div className={`cl-badge ${badgeClass}`}>
        <span className="cl-badge-icon" aria-hidden="true">{badgeIcon}</span>
        <span className="cl-badge-label">{label}</span>
      </div>

      {/* Plain-language summary */}
      <p className="cl-result-summary">{summary}</p>

      {/* Art. 2(12) open-source conversion banner (drift #4) */}
      {showOpenSourceBanner && (
        <div className="cl-banner cl-banner-info">
          <strong>Open-source exclusion applied (Art. 2(12)):</strong>
          <p>{OPEN_SOURCE_EXCLUSION_NOTICE}</p>
        </div>
      )}

      {/* Deployer obligation exempt notice (drift #5) */}
      {showDeployerExempt && (
        <div className="cl-banner cl-banner-info">
          <strong>Deployer obligations do not apply to you (Art. 2(10)):</strong>
          <p>{DEPLOYER_EXEMPT_NOTICE}</p>
        </div>
      )}

      {/* Triggering reasons */}
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

      {/* Art. 6(3) exception panel */}
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

      {/* GPAI panel */}
      {showGpaiPanel && (
        <section className="cl-result-section">
          <h3>GPAI model track</h3>
          <div className="cl-gpai-meta">
            <span className={`cl-gpai-pill cl-${result.model_result}`}>
              {CLASSIFIER_SCHEMA.displayLabels[result.model_result]}
            </span>
            <span className="cl-gpai-holder">
              Obligations held by:{" "}
              <strong>
                {result.gpai_obligation_holder === "self"
                  ? "You (as provider)"
                  : result.gpai_obligation_holder === "upstream_provider"
                    ? "Upstream provider"
                    : result.gpai_obligation_holder === "unknown"
                      ? "Unknown"
                      : "Not applicable"}
              </strong>
            </span>
          </div>
          {result.gpai_open_source_exception && (
            <p className="cl-gpai-note">
              Art. 53(2) open-source exception applies — reduced transparency obligations (copyright
              obligations still apply).
            </p>
          )}
        </section>
      )}

      {/* Art. 50 transparency triggers */}
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

      {/* Timing */}
      <section className="cl-result-section">
        <h3>Compliance deadline</h3>
        <p>
          <strong>{result.timing.compliance_deadline}</strong>
          {result.timing.rules_enforceable_now && " — enforceable now"}
        </p>
        {result.timing.public_authority_deadline && (
          <p className="cl-result-note">
            Public authority legacy deadline: {result.timing.public_authority_deadline}
          </p>
        )}
        {result.timing.gpai_legacy_deadline && (
          <p className="cl-result-note">
            GPAI legacy compliance deadline: {result.timing.gpai_legacy_deadline}
          </p>
        )}
      </section>

      {/* What this means for you */}
      {result.post_classification_notes.length > 0 && (
        <section className="cl-result-section">
          <h3>What this means for you</h3>
          <ul className="cl-notes-list">
            {result.post_classification_notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Confidence indicator */}
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

      {/* Actions */}
      <div className="cl-result-actions">
        <button type="button" className="cl-btn-primary" onClick={onDownloadPdf}>
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
