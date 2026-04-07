import { useState, useMemo } from "preact/hooks";
import { CLUSTERS, CONTROLS } from "../../data/eu-ai-act-controls";
import type { Control } from "../../data/eu-ai-act-controls";
import { ControlsTable } from "./ControlsTable";
import { exportControlsToCSV } from "./csvExport";

const UNIQUE_OWNERS = [...new Set(CONTROLS.map((c) => c.owner))];
const UNIQUE_CADENCES = [...new Set(CONTROLS.map((c) => c.cadence))];
const UNIQUE_ARTICLES = [...new Set(CONTROLS.flatMap((c) => c.articles))].sort(
  (a, b) => parseInt(a) - parseInt(b)
);

export default function ControlsGrid() {
  const [role, setRole] = useState("all");
  const [cluster, setCluster] = useState("all");
  const [owner, setOwner] = useState("all");
  const [cadence, setCadence] = useState("all");
  const [article, setArticle] = useState("all");
  const [evidence, setEvidence] = useState("all");

  const filtered = useMemo(() => {
    return CONTROLS.filter((c) => {
      if (role !== "all" && c.role !== role) return false;
      if (cluster !== "all" && c.cluster !== cluster) return false;
      if (owner !== "all" && c.owner !== owner) return false;
      if (cadence !== "all" && c.cadence !== cadence) return false;
      if (article !== "all" && !c.articles.includes(article)) return false;
      if (evidence !== "all" && c.evidenceType !== evidence) return false;
      return true;
    });
  }, [role, cluster, owner, cadence, article, evidence]);

  const controlsByCluster = useMemo(() => {
    const map = new Map<string, Control[]>();
    for (const c of filtered) {
      const list = map.get(c.cluster) || [];
      list.push(c);
      map.set(c.cluster, list);
    }
    return map;
  }, [filtered]);

  const resetFilters = () => {
    setRole("all");
    setCluster("all");
    setOwner("all");
    setCadence("all");
    setArticle("all");
    setEvidence("all");
  };

  const hasFilters =
    role !== "all" ||
    cluster !== "all" ||
    owner !== "all" ||
    cadence !== "all" ||
    article !== "all" ||
    evidence !== "all";

  return (
    <>
      <div className="filters-bar">
        <div className="filter-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole((e.target as HTMLSelectElement).value)}>
            <option value="all">All</option>
            <option value="Provider">Provider</option>
            <option value="Deployer">Deployer</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Cluster</label>
          <select value={cluster} onChange={(e) => setCluster((e.target as HTMLSelectElement).value)}>
            <option value="all">All</option>
            {CLUSTERS.map((c) => (
              <option key={c.key} value={c.key}>{c.title}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Owner</label>
          <select value={owner} onChange={(e) => setOwner((e.target as HTMLSelectElement).value)}>
            <option value="all">All</option>
            {UNIQUE_OWNERS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Cadence</label>
          <select value={cadence} onChange={(e) => setCadence((e.target as HTMLSelectElement).value)}>
            <option value="all">All</option>
            {UNIQUE_CADENCES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Article</label>
          <select value={article} onChange={(e) => setArticle((e.target as HTMLSelectElement).value)}>
            <option value="all">All</option>
            {UNIQUE_ARTICLES.map((a) => (
              <option key={a} value={a}>Art. {a}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Evidence</label>
          <select value={evidence} onChange={(e) => setEvidence((e.target as HTMLSelectElement).value)}>
            <option value="all">All</option>
            <option value="documentation">Documentation</option>
            <option value="test-results">Test / eval results</option>
            <option value="monitoring">Monitoring records</option>
            <option value="incident">Incident records</option>
            <option value="process">Process records</option>
          </select>
        </div>
        <div className="filter-actions">
          <button className="filter-reset" onClick={resetFilters}>
            Reset filters
          </button>
          {hasFilters && (
            <button
              className="export-btn"
              onClick={() => exportControlsToCSV(filtered, "eu-ai-act-controls-filtered.csv")}
            >
              Export filtered ({filtered.length})
            </button>
          )}
          <button
            className="export-btn"
            onClick={() => exportControlsToCSV(CONTROLS, "eu-ai-act-controls.csv")}
          >
            Export all
          </button>
        </div>
      </div>

      <div className="count-bar">
        Showing {filtered.length} of {CONTROLS.length} controls
      </div>

      <ControlsTable clusters={CLUSTERS} controlsByCluster={controlsByCluster} />
    </>
  );
}
