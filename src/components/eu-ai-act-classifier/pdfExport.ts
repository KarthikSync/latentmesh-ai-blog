// PDF export — programmatic, client-side. Mirrors the Blob/anchor/gtag
// pattern used by src/components/controls-grid/csvExport.ts.

import { jsPDF } from "jspdf";
import { CLASSIFIER_SCHEMA, SCHEMA_VERSION } from "../../data/eu-ai-act-classifier/schema";
import {
  CONFIDENCE_COPY,
  RESULT_SUMMARIES,
} from "../../data/eu-ai-act-classifier/copy";
import type { Result } from "../../data/eu-ai-act-classifier/types";

const PAGE_WIDTH = 595.28; // A4 points
const MARGIN_X = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

export function downloadResultPdf(result: Result): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = 56;

  const writeLine = (text: string, size = 10, bold = false) => {
    if (y > 780) {
      doc.addPage();
      y = 56;
    }
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    doc.text(lines, MARGIN_X, y);
    y += lines.length * (size + 3);
  };

  const section = (title: string) => {
    y += 8;
    writeLine(title.toUpperCase(), 9, true);
    doc.setDrawColor(180);
    doc.line(MARGIN_X, y - 2, PAGE_WIDTH - MARGIN_X, y - 2);
    y += 4;
  };

  // ── Header ──
  writeLine("EU AI Compliance Checker", 16, true);
  writeLine("Preliminary Risk Assessment", 11);
  writeLine(`Schema v${SCHEMA_VERSION} · Generated ${new Date().toISOString().slice(0, 10)}`, 9);
  y += 8;

  // ── Classification ──
  section("Classification");
  writeLine(CLASSIFIER_SCHEMA.displayLabels[result.system_result], 14, true);
  writeLine(RESULT_SUMMARIES[result.system_result], 10);

  // ── Open-source exclusion banner ──
  if (result.scope_status === "excluded_under_art_2_12") {
    section("Open-source exclusion (Art. 2(12))");
    writeLine(
      "This system is excluded from the scope of the EU AI Act under Article 2(12) because it is released under a free and open-source licence, does not fall into a high-risk or prohibited category, and does not trigger any Article 50 transparency obligations.",
      10
    );
  }

  // ── Deployer exemption ──
  if (result.deployer_obligation_exempt) {
    section("Deployer obligation exemption (Art. 2(10))");
    writeLine(
      "Because you are using this system for personal, non-professional purposes, you are exempt from deployer obligations. Provider obligations still apply to whoever built the system.",
      10
    );
  }

  // ── Triggering reasons ──
  if (result.system_reasons.length > 0) {
    section("Why this classification");
    for (const r of result.system_reasons) {
      writeLine(`• ${r.label} [${r.legal_ref}]`, 10, true);
      writeLine(`  ${r.plain_explanation}`, 9);
    }
  }

  // ── Art. 6(3) exception ──
  if (result.article_6_3_exception.checked) {
    section("Article 6(3) exception");
    if (result.article_6_3_exception.applies) {
      writeLine("Exception may apply.", 10, true);
      writeLine(
        "Provider obligations: document this assessment under Art. 6(4) and register the system in the EU database under Article 49(2). Make documentation available to national competent authorities on request. There is no proactive notification duty.",
        9
      );
    } else {
      writeLine("Exception does not apply.", 10, true);
      writeLine(result.article_6_3_exception.reason ?? "", 9);
    }
  }

  // ── GPAI ──
  if (result.model_result !== "none") {
    section("GPAI model track");
    writeLine(CLASSIFIER_SCHEMA.displayLabels[result.model_result], 11, true);
    const holderText =
      result.gpai_obligation_holder === "self"
        ? "Obligations held by: you (as provider)"
        : result.gpai_obligation_holder === "upstream_provider"
          ? "Obligations held by: upstream provider (not you)"
          : `Obligations held by: ${result.gpai_obligation_holder}`;
    writeLine(holderText, 10);
    if (result.gpai_open_source_exception) {
      writeLine(
        "Art. 53(2) open-source exception applies — reduced transparency obligations (copyright obligations still apply).",
        9
      );
    }
  }

  // ── Art. 50 ──
  if (result.article_50_transparency_triggers.length > 0) {
    section("Article 50 transparency obligations");
    for (const t of result.article_50_transparency_triggers) {
      writeLine(`• ${t.obligation} [${t.article}]`, 9);
    }
  }

  // ── Timing ──
  section("Compliance deadline");
  writeLine(
    `Primary deadline: ${result.timing.compliance_deadline}${result.timing.rules_enforceable_now ? " (enforceable now)" : ""}`,
    10
  );
  if (result.timing.public_authority_deadline) {
    writeLine(`Public authority legacy deadline: ${result.timing.public_authority_deadline}`, 9);
  }
  if (result.timing.gpai_legacy_deadline) {
    writeLine(`GPAI legacy deadline: ${result.timing.gpai_legacy_deadline}`, 9);
  }

  // ── What this means for you ──
  if (result.post_classification_notes.length > 0) {
    section("What this means for you");
    for (const note of result.post_classification_notes) {
      writeLine(`• ${note}`, 9);
    }
  }

  // ── Confidence ──
  section("Confidence");
  const confidence = CONFIDENCE_COPY[result.confidence];
  writeLine(confidence.label, 10, true);
  writeLine(confidence.explanation, 9);
  if (result.unsure_fields.length > 0) {
    writeLine(`Questions answered "unsure": ${result.unsure_fields.join(", ")}`, 9);
  }

  // ── Footer on every page ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `Not legal advice. Schema v${SCHEMA_VERSION}. latentmesh.ai/tools/eu-ai-compliance-checker/`,
      MARGIN_X,
      820
    );
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN_X, 820, { align: "right" });
    doc.setTextColor(0);
  }

  const filename = `eu-ai-compliance-checker-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);

  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "pdf_downloaded", {
      system_result: result.system_result,
      model_result: result.model_result,
      confidence: result.confidence,
    });
  }
}
