---
title: "The Regulatory Mapping Table"
description: "An interactive reference that turns EU AI Act high-risk obligations into operating controls, verification methods, evidence artifacts, owners, and review cadence. Filter by role, article, cluster, or cadence to map obligations into your operating responsibilities."
pubDate: "Apr 05 2026 16:00"
tags: ["compliance", "practical", "evidence"]
summary: "Twenty-five operating controls derived from Articles 9 through 15, 26 through 27, and 72 through 73 of the EU AI Act, organized into eight clusters: risk management, data governance, technical documentation, logging and traceability, transparency, human oversight, accuracy and robustness, and post-market monitoring. Each row answers five questions: what control do I need, how do I verify it holds, what evidence does that produce, who owns it, and when must it be reviewed. The interactive table filters by role (provider or deployer), article, cluster, owner, or cadence. This version covers Annex III high-risk systems. Annex III obligations apply from 2 August 2026. The Digital Omnibus proposal could adjust parts of the timeline but should be treated as draft until adopted."
summaryProblem: "Teams cannot translate EU AI Act articles into operating responsibilities with owners and cadence."
summaryCoreIdea: "Twenty-five controls across eight clusters, each mapped to a verification method, evidence artifact, and owner."
summaryTakeaway: "A filterable reference table that turns regulatory text into operating procedures by role and review cadence."
---

*The regulation tells you what to prove. The mapping table tells you how to operate the proof.*

---

*This is a companion to [Mapping the EU AI Act to Engineering Evidence](/blog/mapping-the-eu-ai-act-to-engineering-evidence/) in the Reliable Agent Systems series.*

---

[Essay #9](/blog/mapping-the-eu-ai-act-to-engineering-evidence/) mapped EU AI Act obligations to engineering evidence. [From Obligation to Evidence in 90 Minutes](/blog/from-obligation-to-evidence-in-90-minutes/) walked through the loop for a single article. This reference operationalizes many obligations at once.

## What this reference covers

Twenty-five operating controls derived from Articles 9–15, 26–27, and 72–73 of the EU AI Act, organized into eight clusters:

1. **Risk Management** — continuous risk identification, residual risk documentation, risk-proportionate testing
2. **Data Governance** — training data quality controls, bias monitoring, data-sheet maintenance
3. **Technical Documentation** — system design records, model cards, change-log discipline
4. **Logging and Traceability** — automatic event logging, log retention, audit trail completeness
5. **Transparency** — user-facing disclosure, interaction transparency, decision explainability
6. **Human Oversight** — override mechanisms, escalation protocols, operator competence
7. **Accuracy, Robustness and Cybersecurity** — performance baselines, adversarial testing, security controls
8. **Post-Market Monitoring and Incidents** — field performance tracking, serious incident reporting, corrective action

Each row answers five questions: *What control do I need? How do I verify it holds? What evidence does that produce? Who owns it? When must it be reviewed?*

## How to use it

The reference is an interactive, filterable table. Start with **role** (Provider or Deployer) to see only the obligations that apply to you. Then use **article**, **cluster**, **owner**, or **cadence** to map each obligation into your operating responsibilities.

Click any row to expand interpretation notes, framework crosswalks (ISO 42001, NIST AI RMF), and direct links to the official regulation text.

<div style="margin: 2rem 0; padding: 1.5rem; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-bg-secondary, #f9f9f7);">
  <p style="margin: 0 0 1rem; font-weight: 600;">EU AI Act: High-Risk AI Operational Control Reference</p>
  <p style="margin: 0 0 1rem; color: var(--color-text-secondary); font-size: 0.9rem;">25 controls · 8 clusters · Filterable by role, article, owner, cadence, and evidence type</p>
  <a href="/reference/eu-ai-act-controls/" style="display: inline-block; padding: 0.6rem 1.2rem; background: var(--color-text-primary, #1a1a18); color: var(--color-bg-primary, #fff); border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 0.9rem;">Open the interactive reference →</a>
</div>

## Scope and dates

This version focuses on **Annex III high-risk AI systems** and selected provider/deployer operational duties. It does not yet cover high-risk AI systems embedded in regulated products (Annex I), conformity assessment procedures, EU database registration, or value-chain obligations in full.

Under the AI Act as currently in force, Annex III high-risk obligations apply from **2 August 2026** and high-risk AI systems embedded in regulated products from **2 August 2027**. The Commission has proposed amendments through the Digital Omnibus (published 19 November 2025), but those changes should be treated as draft until adopted.

## How this connects

The [Reliable Agent Systems](/series/) series has been building toward this: [Controls Are Not Guardrails](/blog/controls-are-not-guardrails/) defined what a control is. [Anatomy of an Evidence Pack](/blog/anatomy-of-an-evidence-pack/) defined what evidence looks like. [Essay #9](/blog/mapping-the-eu-ai-act-to-engineering-evidence/) mapped obligations to engineering artifacts. This table turns that mapping into operating procedures — the controls you run, the evidence they produce, and the cadence at which you review them.

---

*Previously: [Drift Detection Patterns for Production Agents](/blog/drift-detection-patterns-for-production-agents/). Related series essay: [Mapping the EU AI Act to Engineering Evidence](/blog/mapping-the-eu-ai-act-to-engineering-evidence/).*

---

## Selected references

- EU AI Act, Articles 9–15, 26–27, 72–73. Regulation (EU) 2024/1689, Official Journal of the European Union. https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- ISO/IEC 42001:2023, Information technology — Artificial intelligence — Management system. https://www.iso.org/standard/81230.html
- NIST AI Risk Management Framework (AI RMF 1.0). https://www.nist.gov/artificial-intelligence/ai-risk-management-framework
