// Four-block obligation list component.
// Block 1: Coverage banner (split by track)
// Block 2: Priority queue ("Start here" — directly applicable only)
// Block 3: System obligations by category (collapsible)
// Block 4: Model obligations (flat list)

import { useMemo, useState } from "preact/hooks";
import { ALL_OBLIGATIONS } from "../../data/eu-ai-act-classifier/obligations";
import {
  buildDisplayContext,
  buildModelProfile,
  buildSystemProfile,
} from "../../lib/eu-ai-act-classifier/bridge";
import {
  filterModelObligations,
  filterSystemObligations,
  type FilteredModelObligation,
} from "../../lib/eu-ai-act-classifier/obligationFilter";
import {
  rankByPriority,
  renderObligations,
} from "../../lib/eu-ai-act-classifier/priorityRanker";
import type { Result } from "../../data/eu-ai-act-classifier/types";
import type {
  ObligationCategory,
  RenderedObligation,
} from "../../data/eu-ai-act-classifier/obligation-types";
import { EXCEPTION_OBLIGATIONS } from "../../data/eu-ai-act-classifier/obligations";
import { ObligationCard } from "./ObligationCard";
import { CoverageBanner } from "./CoverageBanner";

interface Props {
  result: Result;
  role: string; // "Provider" | "Deployer" | "Both"
  substantiallyModified: boolean;
}

// Block 3 render decision
const SYSTEM_RENDER_RESULTS = new Set([
  "high_risk_annex_i",
  "high_risk_annex_iii",
  "limited_risk_transparency",
]);

// System category display order and labels
const CATEGORY_LABELS: Partial<Record<ObligationCategory, string>> = {
  risk_management: "Risk Management",
  data_governance: "Data Governance",
  technical_documentation: "Technical Documentation",
  record_keeping: "Record-Keeping and Logging",
  transparency_deployer: "Transparency to Deployers",
  human_oversight: "Human Oversight",
  accuracy_robustness_cybersecurity: "Accuracy, Robustness, and Cybersecurity",
  post_market_monitoring: "Post-Market Monitoring",
  incident_reporting: "Incident Reporting",
  registration: "Registration",
  deployer_general_duties: "Deployer Duties",
  deployer_monitoring: "Deployer Monitoring",
  deployer_record_keeping: "Deployer Record-Keeping",
  transparency_disclosure: "Transparency and Disclosure",
};

const NO_SYSTEM_MESSAGES: Record<string, string> = {
  not_ai_system:
    "This software does not meet the AI system definition under Article 3(1). No EU AI Act obligations apply.",
  out_of_scope:
    "This AI system is outside the scope of the EU AI Act.",
  prohibited:
    "This practice is prohibited under Article 5. It cannot be deployed in the EU. Consult legal counsel immediately.",
  minimal_risk:
    "No specific system obligations identified by this tool for your profile. Other obligations such as AI literacy (Art. 4) may still apply to your organisation.",
};

export function ObligationList({ result, role, substantiallyModified }: Props) {
  // Compute effective role: if substantially modified, treat as Provider
  const effectiveRole = substantiallyModified ? "Provider" : role;

  const displayContext = useMemo(() => buildDisplayContext(result), [result]);

  // ── System track ──────────────────────────────────────────────
  const showBlock3 = SYSTEM_RENDER_RESULTS.has(result.system_result);

  const systemProfile = useMemo(
    () => buildSystemProfile(result, effectiveRole),
    [result, effectiveRole]
  );

  const filteredSystemObligations = useMemo(
    () => (showBlock3 ? filterSystemObligations(ALL_OBLIGATIONS, systemProfile) : []),
    [showBlock3, systemProfile]
  );

  const renderedSystemObligations = useMemo(
    () => renderObligations(filteredSystemObligations, displayContext),
    [filteredSystemObligations, displayContext]
  );

  // Group by category for Block 3
  const systemByCategory = useMemo(() => {
    const map = new Map<string, RenderedObligation[]>();
    for (const obl of renderedSystemObligations) {
      const list = map.get(obl.category) ?? [];
      list.push(obl);
      map.set(obl.category, list);
    }
    // Sort within each category by date then source_code
    for (const list of map.values()) {
      list.sort((a, b) =>
        a.display_effective_from !== b.display_effective_from
          ? a.display_effective_from < b.display_effective_from ? -1 : 1
          : a.source_code.localeCompare(b.source_code)
      );
    }
    return map;
  }, [renderedSystemObligations]);

  // ── Exception duties (Art. 6(3) success) ──────────────────────
  const showExceptionDuties =
    result.article_6_3_exception.checked && result.article_6_3_exception.applies;

  const renderedExceptionDuties = useMemo(() => {
    if (!showExceptionDuties) return [];
    return renderObligations(EXCEPTION_OBLIGATIONS, displayContext);
  }, [showExceptionDuties, displayContext]);

  // ── Model track ───────────────────────────────────────────────
  const showBlock4 = result.model_result !== "none";

  const modelProfile = useMemo(
    () => buildModelProfile(result),
    [result]
  );

  const filteredModelObligations = useMemo(
    () => (showBlock4 ? filterModelObligations(ALL_OBLIGATIONS, modelProfile) : []),
    [showBlock4, modelProfile]
  );

  const renderedModelObligations = useMemo(
    () =>
      filteredModelObligations.map((f) => ({
        rendered: renderObligations([f.record], displayContext)[0],
        showOpenSourceNote: f.showOpenSourceNote,
      })),
    [filteredModelObligations, displayContext]
  );

  const isUpstreamProvider = result.gpai_obligation_holder === "upstream_provider";

  // ── Block 2: Priority queue (directly applicable only) ────────
  const directlyApplicable = useMemo(() => {
    const direct: RenderedObligation[] = [...renderedSystemObligations];
    // Add self-held model obligations (not upstream)
    if (!isUpstreamProvider) {
      for (const item of renderedModelObligations) {
        direct.push(item.rendered);
      }
    }
    return direct;
  }, [renderedSystemObligations, renderedModelObligations, isUpstreamProvider]);

  const priorityQueue = useMemo(
    () => rankByPriority(directlyApplicable, displayContext),
    [directlyApplicable, displayContext]
  );

  const showBlock2 = priorityQueue.length > 0 && !(
    result.system_result === "limited_risk_transparency" && filteredModelObligations.length === 0
  );

  // ── Block 1: Coverage banner ──────────────────────────────────
  const showBlock1 = showBlock3 || showBlock4;

  const systemArticles = useMemo(() => {
    const articles = new Set(filteredSystemObligations.map((o) => o.source_code.split("(")[0].trim()));
    return Array.from(articles).sort().join(", ");
  }, [filteredSystemObligations]);

  // ── Collapsible category state ────────────────────────────────
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Global expand/collapse for obligation card sections — toggling one
  // card's "Why this applies" or "Priority reasoning" toggles all cards.
  const [allWhyExpanded, setAllWhyExpanded] = useState(false);
  const [allPriorityExpanded, setAllPriorityExpanded] = useState(false);
  const toggleAllWhy = () => setAllWhyExpanded((v) => !v);
  const toggleAllPriority = () => setAllPriorityExpanded((v) => !v);
  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // ── No obligations at all ─────────────────────────────────────
  if (!showBlock3 && !showBlock4 && !showExceptionDuties) {
    const msg = NO_SYSTEM_MESSAGES[result.system_result] ?? "No obligations identified.";
    return (
      <div className="cl-obligation-list">
        <p className="cl-obl-empty">{msg}</p>
      </div>
    );
  }

  return (
    <div className="cl-obligation-list">
      {/* Ambiguous confidence warning */}
      {result.confidence === "ambiguous_consult_legal" && (
        <div className="cl-obl-ambiguity-note" role="alert">
          Your classification has unresolved ambiguities. The obligations shown assume the
          classification is correct. We recommend confirming with legal counsel.
        </div>
      )}

      {/* Legacy system note */}
      {result.timing.legacy_system && (
        <div className="cl-obl-legacy-note">
          Your system was on the market before the application date. These obligations apply if you
          make a significant design change.
        </div>
      )}

      {/* Block 1: Coverage banner */}
      {showBlock1 && (
        <CoverageBanner
          showSystemTrack={showBlock3}
          showModelTrack={showBlock4}
          systemArticleCount={new Set(filteredSystemObligations.map((o) => o.source_code.split("(")[0].trim())).size}
          systemArticles={systemArticles}
        />
      )}

      {/* Block 2: Priority queue */}
      {showBlock2 && (
        <section className="cl-obl-block cl-obl-priority-block">
          <h3 className="cl-obl-block-title">Start here</h3>
          {priorityQueue.map((obl) => (
            <ObligationCard key={obl.obligation_id} obligation={obl} whyExpanded={allWhyExpanded} priorityExpanded={allPriorityExpanded} onToggleWhy={toggleAllWhy} onTogglePriority={toggleAllPriority} />
          ))}
        </section>
      )}

      {/* Block 3: System obligations by category */}
      {showBlock3 && renderedSystemObligations.length > 0 && (
        <section className="cl-obl-block">
          <h3 className="cl-obl-block-title">System obligations</h3>
          {Array.from(systemByCategory.entries()).map(([category, obligations]) => {
            const label = CATEGORY_LABELS[category as ObligationCategory] ?? category;
            const isExpanded = expandedCategories.has(category);
            return (
              <div key={category} className="cl-obl-category">
                <button
                  type="button"
                  className="cl-obl-category-toggle"
                  onClick={() => toggleCategory(category)}
                  aria-expanded={isExpanded}
                >
                  <span className="cl-obl-category-label">{label}</span>
                  <span className="cl-obl-category-count">({obligations.length})</span>
                  <span className="cl-obl-category-chevron">{isExpanded ? "▾" : "▸"}</span>
                </button>
                {isExpanded && (
                  <div className="cl-obl-category-body">
                    {obligations.map((obl) => (
                      <ObligationCard key={obl.obligation_id} obligation={obl} whyExpanded={allWhyExpanded} priorityExpanded={allPriorityExpanded} onToggleWhy={toggleAllWhy} onTogglePriority={toggleAllPriority} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Art. 50 only message for limited_risk */}
      {showBlock3 && renderedSystemObligations.length === 0 && result.system_result === "limited_risk_transparency" && (
        <p className="cl-obl-empty">
          Showing system-level transparency obligations only. No high-risk obligations apply.
        </p>
      )}

      {/* No system obligations message when block 3 is off */}
      {!showBlock3 && showBlock4 && (
        <p className="cl-obl-system-msg">
          {NO_SYSTEM_MESSAGES[result.system_result] ?? ""}
        </p>
      )}

      {/* Exception duties section */}
      {showExceptionDuties && renderedExceptionDuties.length > 0 && (
        <section className="cl-obl-block cl-obl-exception-block">
          <h3 className="cl-obl-block-title">Duties that still apply after the Art. 6(3) exception</h3>
          <p className="cl-obl-exception-intro">
            The Art. 6(3) exception removes your system from high-risk classification, but these
            obligations remain.
          </p>
          {renderedExceptionDuties.map((obl) => (
            <ObligationCard key={obl.obligation_id} obligation={obl} whyExpanded={allWhyExpanded} priorityExpanded={allPriorityExpanded} onToggleWhy={toggleAllWhy} onTogglePriority={toggleAllPriority} />
          ))}
        </section>
      )}

      {/* Block 4: Model obligations */}
      {showBlock4 && renderedModelObligations.length > 0 && (
        <section className="cl-obl-block cl-obl-model-block">
          <h3 className="cl-obl-block-title">GPAI model obligations</h3>
          {isUpstreamProvider && (
            <div className="cl-obl-upstream-note">
              <span className="cl-obl-upstream-icon" aria-hidden="true">ⓘ</span>
              These obligations fall on your upstream model provider, not directly on you. Shown so
              you understand the regulatory context of the model you depend on.
            </div>
          )}
          {result.gpai_open_source_exception && result.model_result === "gpai" && (
            <p className="cl-obl-oss-banner">
              Reduced obligations apply for open-source GPAI models under Art. 53(2).
            </p>
          )}
          {renderedModelObligations.map((item) => (
            <ObligationCard
              key={item.rendered.obligation_id}
              obligation={item.rendered}
              showOpenSourceNote={item.showOpenSourceNote}
              isUpstreamProvider={isUpstreamProvider}
              whyExpanded={allWhyExpanded}
              priorityExpanded={allPriorityExpanded}
              onToggleWhy={toggleAllWhy}
              onTogglePriority={toggleAllPriority}
            />
          ))}
        </section>
      )}
    </div>
  );
}
