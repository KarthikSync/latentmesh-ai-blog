import { useState } from "preact/hooks";
import type { Control, ClusterMeta } from "../../data/eu-ai-act-controls";
import { ControlDetailRow } from "./ControlDetailRow";

interface Props {
  clusters: ClusterMeta[];
  controlsByCluster: Map<string, Control[]>;
}

export function ControlsTable({ clusters, controlsByCluster }: Props) {
  return (
    <div className="main">
      {clusters.map((cluster) => {
        const controls = controlsByCluster.get(cluster.key);
        if (!controls || controls.length === 0) return null;
        return (
          <ClusterSection
            key={cluster.key}
            cluster={cluster}
            controls={controls}
          />
        );
      })}
    </div>
  );
}

function ClusterSection({
  cluster,
  controls,
}: {
  cluster: ClusterMeta;
  controls: Control[];
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`cluster-section ${collapsed ? "collapsed" : ""}`}>
      <button
        className="cluster-toggle"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div>
          <span className="cluster-title">{cluster.title}</span>
          <span className="cluster-articles">{cluster.articles}</span>
        </div>
        <div className="cluster-meta">
          <span className="cluster-count">
            {controls.length} control{controls.length !== 1 ? "s" : ""}
          </span>
          <span className="cluster-chevron">&#9660;</span>
        </div>
      </button>
      <div className="cluster-body">
        <table className="ctrl-table" role="grid" aria-label={`${cluster.title} controls`}>
          <thead className="sr-only">
            <tr>
              <th className="col-obl">Obligation</th>
              <th className="col-role">Role</th>
              <th className="col-ctrl">Control Objective</th>
              <th className="col-eval">Eval</th>
              <th className="col-evid">Evidence</th>
              <th className="col-owner">Owner</th>
              <th className="col-cadence">Cadence</th>
              <th className="col-fw">Frameworks</th>
            </tr>
          </thead>
          <tbody>
            {controls.map((control) => (
              <ControlDetailRow key={control.id} control={control} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
