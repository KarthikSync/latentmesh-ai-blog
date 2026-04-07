import type { Control } from "../../data/eu-ai-act-controls";

const escapeCSV = (val: string): string => {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
};

export function exportControlsToCSV(
  controls: Control[],
  filename: string = "eu-ai-act-controls.csv"
): void {
  const headers = [
    "ID",
    "Cluster",
    "Role",
    "Obligation",
    "Article",
    "Control Objective",
    "Eval / Verification",
    "Evidence Artifact",
    "Owner",
    "Cadence",
    "Frameworks",
  ];

  const rows = controls.map((c) =>
    [
      c.id,
      c.cluster,
      c.role,
      c.obligation,
      c.articleRef,
      c.controlObjective,
      c.evalVerification,
      c.evidenceArtifact,
      c.owner,
      c.cadence,
      c.frameworks,
    ]
      .map(escapeCSV)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
